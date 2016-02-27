module.exports = function(grunt) {

  grunt.initConfig({
	'create-windows-installer': {
	  x64: {
		appDirectory: '/Users/aless/Documents/LIM/LIM-win32-x64',
		outputDirectory: '/Users/aless/Documents/LIM/Installer/x64',
		authors: 'Andrea Franchini, Alessandro Astone',
		exe: 'LIM.exe',
		title: 'LIM',
		noMsi: true
	  },
	  ia32: {
		appDirectory: '/Users/aless/Documents/LIM/LIM-win32-ia32',
		outputDirectory: '/Users/aless/Documents/LIM/Installer/x32',
		authors: 'Andrea Franchini, Alessandro Astone',
		exe: 'LIM.exe',
		title: 'LIM',
		noMsi: true
	  }
	}
	'electron':{
	  win32: {
 		options: {
	 	  'version-string': {
	 		ProductName: 'Your App'
	 	  }
	 	}
	  }
	}
  });

  grunt.loadNpmTasks('grunt-electron-installer');

  grunt.registerTask('default', ['jshint']);

};