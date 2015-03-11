app.controller('CustomInputController', ['$scope', 'SocketSrv', 'ProfileSrv',
    function(scope, SocketSrv, ProfileSrv) {
        scope.customInputData = {
            item: '',
        };
        scope.customInputList = {};
        scope.customInputRequest = {
            item: 'customInputTest',
            numberOfInputs: 1,
        };
        scope.customInputSelectionSubmitted = false;
        scope.customInputFormSubmitted = false;
        scope.dataIsValid = true;
        scope.customInputTable = 'placeholder';
        scope.autoUpdateOn = true;
        scope.inputChanged = function(event) {
            if (scope.autoUpdateOn || !!event) {
                SocketSrv.socket.emit('updateCustomInput', scope.customInputData);
            };
        };
        //share profile data to profile service
        scope.$on('getProfile', function() {
            ProfileSrv.profile.customInputList = scope.customInputList;
            ProfileSrv.profile.customInputData = scope.customInputData;
            ProfileSrv.profile.customInputSelectionSubmitted = scope.customInputSelectionSubmitted;
            ProfileSrv.profile.customInputFormSubmitted = scope.customInputFormSubmitted;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.customInputData = ProfileSrv.profile.customInputData;
            scope.customInputSelectionSubmitted = ProfileSrv.profile.customInputSelectionSubmitted;
            scope.customInputList = ProfileSrv.profile.customInputList;
            scope.customInputFormSubmitted = ProfileSrv.profile.customInputFormSubmitted;
            scope.customInputTable = generateInputTable(scope.customInputList, scope.customInputTable);
        });
        //when user submits number of inputs requested, create list element
        //with empty name and type fields for each input.
        scope.customInputSelectionSubmit = function() {
            scope.customInputSelectionSubmitted = true;
            for (var i = 1; i <= scope.customInputRequest.numberOfInputs; i++) {
                scope.customInputList[i.toString()] = {
                    name: "",
                    type: "text",
                }
            };
        };
        //runs once name and type for each input is selected by user
        scope.customInputFormSubmit = function() {
            //check if names and ranges are valid.
            //(no repeating names, no names starting with numbers min<max.)
            scope.dataIsValid = dataIsValid();
            if (scope.dataIsValid) {
                //build customInputData with the item and input names requested.
                scope.customInputData.item = scope.customInputRequest.item;
                for (var key in scope.customInputList) {
                    scope.customInputData[scope.customInputList[key].name] = 0;
                };
                //generate the custom inputs.
                scope.customInputTable = generateInputTable(scope.customInputList, scope.customInputTable);
                scope.customInputFormSubmitted = true;
            };
        };
        //generate the markup required (stored in a string, customInputTable)
        //for inputs, by concatenating strings of HTML.
        generateInputTable = function(inputList, customInputTable) {
            var inputTableHeader;
            var inputTableCell;
            //begin row
            customInputTable = "<tr>";
            //insert header for each input, with its name
            for (var key in inputList) {
                inputTableHeader = "<th>" + inputList[key].name + "</th>";
                customInputTable = customInputTable.concat(inputTableHeader);
            };
            //end row, start new row
            customInputTable = customInputTable.concat("</tr><tr>");
            //for each input, insert the type of input neccesary plus
            //the directive data-ng-model to bind the input with the model (customInputData on scope)
            for (var key in inputList) {
                inputTableCell = "<td><input type=\"" + inputList[key].type + "\" data-ng-model=\"customInputData." + inputList[key]["name"] + "\" ";
                //if a minimum value exists, append the attribute to the input element
                if (!!inputList[key].min) {
                    inputTableCell = inputTableCell.concat("min=\"" + inputList[key].min + "\" ");
                    //initialize the input value to the minimum value
                    scope.customInputData[inputList[key].name] = inputList[key].min;
                };
                //if max exists, append attribute
                if (!!inputList[key].max) {
                    inputTableCell = inputTableCell.concat("max=\"" + inputList[key].max + "\"");
                };
                //if the input is of type range (Slider) show current value
                if (inputList[key].type === "range") {
                    inputTableCell = inputTableCell.concat("data-ng-change=\"inputChanged()\"><br>{{customInputData." + inputList[key].name + "}}</td>");

                } else {
                    inputTableCell = inputTableCell.concat("data-ng-change=\"inputChanged()\"></td>");
                }
                //initialize inputs based on type
                if (inputList[key].type === "checkbox") {
                    scope.customInputData[inputList[key].name] = false;
                }
                if (inputList[key].type === "text") {
                    scope.customInputData[inputList[key].name] = '';
                }
                //end input insertion
                customInputTable = customInputTable.concat(inputTableCell);
            };
            //end row
            customInputTable = customInputTable.concat("</tr>");
            return customInputTable;
        };
        dataIsValid = function() {
            for (var keyI in scope.customInputList) {
                //check for symbols (name will not exist
                //because ng-pattern directive filters it with regex pattern)
                if (!!!scope.customInputList[keyI].name) {
                    return false;
                };
                //check first character for numbers
                if (!isNaN(scope.customInputList[keyI].name.toString().charAt(0))) {
                    return false;
                };
                //check range values (min<max)
                if (!isNaN(scope.customInputList[keyI].min) && !isNaN(scope.customInputList[keyI].max) && scope.customInputList[keyI].min >= scope.customInputList[keyI].max) {
                    return false;
                };
                //check for repeated names
                for (var keyJ in scope.customInputList) {
                    if (keyI != keyJ && (scope.customInputList[keyI].name == scope.customInputList[keyJ].name)) {
                        return false;
                    };
                };
            };

            return true;
        };
    }
]);
//directive required to "parse" the generated HTML (see generateInputTable)
//for scope variables and bind the data.
//(i.e. without this, {{customInputData.x}} would not show the value of
//the property x of scope.customInputData, as it would be interpreted as a constant string)
app.directive('compile', function($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                $compile(element.contents())(scope);
            }
        );
    };
});
