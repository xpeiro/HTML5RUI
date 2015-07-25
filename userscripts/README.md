###User Scripts directory
####Any javascript/python scripts present in this directory will be
####available from the Script Execution module in HRUI.
####Make sure all scripts have correct extensions: .py or .js.
####Files with no instance of .py or .js in their filename will be ignored.
####Execution commands are:
```shell
$ PYTHON userscript.py
``` 
#####or
```shell
$ NODE userscript.js
``` 
#####PYTHON and NODE are parameters defining the path to python/node binaries, defaulting to 'python' and 'node'.
#####Both can be set using config.json file (recommended), or directly in app.js.
#####Scripts will be executed using userscripts as working directory.
