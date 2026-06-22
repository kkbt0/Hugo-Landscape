# build Codeblocks

使用 expressive-code 构建代码块

使用参考 justfile

```sh
ec:
    bun run scripts/ec-code/dist/ec-code.js .

ec-build:
    cd scripts/ec-code/ && bun run build.js

ec-dev:
    bun run scripts/ec-code/src/index.js .
```

构建后约
- ec-code.js.jsc 10MB
- ec-code.js.jsc 17MB

构建可执行文件

```sh
bun build ./src/index.js --compile --outfile ec-code
# 压缩可执行文件 
upx ec-code.exe
```

- 原 ec-code.exe 104MB
- 压缩后 ec-code.exe 33MB 错误，无法执行
