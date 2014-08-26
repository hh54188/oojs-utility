require('node-oojs');

define && define({
    name: 'fileSync',
	namespace: 'oojs.utility',
	/**
	@constructs fileSync
	*/
    $fileSync: function () {
		this.fs = require('fs');
        this.path = require('path');
    },

	/**
	拷贝目录, 会自动递归创建目标文件夹
	@function fileSync.copyDirectorySync
	@static
	@param {string} sourceDirPath 源文件夹
	@param {string} toDirPath 目标文件夹
	@param {function} filter 过滤器,签名为filter(fileName, filePath), 其中fileName为文件名, filePath为文件路径. 
	可以根据fileName和filePath判断当前文件是否需要被过滤.返回false则表示过滤当前文件或文件夹.
	*/
    copyDirectorySync: function (sourceDirPath, toDirPath, filter) {

        sourceDirPath = this.path.resolve(sourceDirPath);
        toDirPath = this.path.resolve(toDirPath);

        var fileList = this.getFileListSync(sourceDirPath, filter);
        var sourcePath = this.path.resolve(sourceDirPath);
        var toPath = this.path.resolve(toDirPath);


        for (var i = 0, count = fileList.length; i < count; i++) {
            var sourceFilePath = fileList[i];
            var toFilePath = sourceFilePath.replace(sourceDirPath, toDirPath);
            this.copyFileSync(sourceFilePath, toFilePath);
        }

        return this;
    },

	/**
	拷贝文件, 会自动递归创建目标文件夹
	@function fileSync.copyFileSync
	@static
	@param {string} sourceFilePath 源文件
	@param {string} toFilePath 目标文件
	*/
    copyFileSync: function (sourceFilePath, toFilePath) {
        var dirPath = this.path.dirname(toFilePath);
        this.mkdirSync(dirPath);
        this.fs.createReadStream(sourceFilePath).pipe(this.fs.createWriteStream(toFilePath));
        //console.log('copy file finished, source:' + sourceFilePath + ',to:' + toFilePath);
        return this;
    },

	/**
	创建文件夹, 会自动递归创建目标文件夹
	@function fileSync.mkdirSync
	@static
	@param {string} filePath 目标文件夹
	@param {number} mode 创建的文件夹的权限, 比如: 0755, 默认为 0777
	*/
    mkdirSync: function (filePath, mode) {
        var filePath = this.path.resolve(filePath);
        mode = mode || 0777;

        //已经存在, 不需要创建
        if (this.fs.existsSync(filePath)) {
            return this;
        }

        //判断分隔符号
        var splitChar = '/';
        if (filePath.indexOf('/') === -1) {
            splitChar = '\\';
        }

        filePathArray = filePath.split(splitChar);

        var currentDir;
        var currentPath;
        var previousPath = '';

        for (var i = 0, count = filePathArray.length; i < count; i++) {
            //获取当前的文件夹名和完成的目录地址
            currentDir = filePathArray[i];

            //处理盘符
            if (i === 0) {
                previousPath = currentDir;
                continue;
            }

            currentPath = previousPath + '/' + currentDir;
            previousPath = currentPath;

            if (!this.fs.existsSync(currentPath)) {
                this.fs.mkdirSync(currentPath, mode);
            }
        }

        return this;
    },

	/**
	获取一个目录中所有的文件
	@function fileSync.getFileListSync
	@static
	@param {string} filePath 目标文件夹
	@param {function} filter 过滤器,签名为filter(fileName, filePath), 其中fileName为文件名, filePath为文件路径. 
	可以根据fileName和filePath判断当前文件是否需要被过滤.返回false则表示过滤当前文件或文件夹.
	*/
    getFileListSync: function (filePath, filter) {
        var result = [];
        filePath = filePath || './'; //默认为当前目录
        var basePath = this.path.resolve(filePath);
        var basePathFiles = this.fs.readdirSync(basePath);

        //开始遍历文件名
        for (var i = 0, count = basePathFiles.length; i < count; i++) {
            var fileName = basePathFiles[i];
            var filePath = basePath + '/' + fileName;
            var fileStat = this.fs.statSync(filePath);

            if (filter && !filter(fileName, filePath)) {
                continue;
            }

            //处理文件
            if (fileStat.isFile()) {
                result.push(filePath);
            }

            //处理文件夹
            if (fileStat.isDirectory()) {
                result = result.concat(this.getFileListSync(filePath, filter));
            }
        }

        return result;
    }

});