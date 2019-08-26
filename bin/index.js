#!/usr/bin/env node
let { join } = require('path');
let { readFile, writeFile, readFileSync } = require('fs');

let command = 'catcat';
let CommandFile = 'catcat-command';
let trigger = 'prepare-commit-msg';
let pargv = process.argv;
var argv = require("minimist")(pargv.slice(2), {
  alias: {
    'command': 'c',
    'build': 'b',
    'init': 'i',
    'unlink': 'u',
    'file': 'f',
    'hook': 'h'
  },
  string: ['build', 'file', 'hook'],
  boolean: ['command', 'init', 'unlink'],
  'default': {
    'file': CommandFile,
    'hook': trigger
    // 'dir': process.cwd()
  }
});

let hooks = {
  // prepareCommit
}
let _dir = process.cwd();
if (argv.help) {
  console.log("使用:");
  console.log(`  ${command} --help // print help information`);
  console.log(`  ${command} // 启动catcat服务器 默认8080`);
  console.log(`  ${command} 8888 // 指定端口启动catcat服务器`);
  console.log(`  ${command} build // 构建文件`);
  console.log(`  ${command} init // 初始化构建器`);
  console.log(`  ${command} unlink // 移除构建器`);
  console.log(`  ${command} hook // 构建器钩子`);
  console.log(`  ${command} file // 构建器指定文件`);
  process.exit(0);
}

var exec = require('child_process').exec;

let { init, build, unlink, file, hook } = argv;

let _file = file || CommandFile;
let _hook = hook || trigger;
// trigger = 'pre-commit'

if (pargv.length <= 2) {
  build = _dir;
}
if (build) {
  console.info('=======building=======');
  let _cmd = readFileSync(join(build, `/${_file}`), {
    encoding: 'utf-8'
  });
  let answer = 'dev';
  let PRO_ENV = `PRO_ENV=${answer}`;
  _cmd = `${PRO_ENV}\n${_cmd}`
  let _exec = exec(_cmd, {
    cwd: build
  }, (err, std, stderr) => {
    if (err) {
      console.warn(stderr)
      return
    }
    console.log(std)
  })
  _exec.stdout.pipe(process.stdout);;

}
if (init) {
  readFile(join(_dir, `/${_file}`), (err, data) => {
    if (err) {
      console.warn(err)
      process.exit(0)
      return;
    }
    if (!err) {
      exec(`
      cd .git/hooks
      chmod +x ${_hook} 
      `, (err, b) => {
          writeFile(join(_dir, `/.git/hooks/${_hook}`),
            `
           #!/bin/sh 
           catcat --build ${_dir} --file ${_file}
          `, (e) => {
              exec(`
                chmod +x ${_file}
              ` )
              console.info('=====初始化成功=====', `${_dir}`)
              process.exit(0)
            })
        })
    }
  })
}
if (unlink) {
  writeFile(join(_dir, `/.git/hooks/${_hook}`),
    ` `, (e) => {
      console.info('=====移除成功=====', `${_dir}`)
      process.exit(0)
    })

}
