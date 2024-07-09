dev:
    hugo server -s exampleSite/ --disableFastRender
e:
    hugo server -s exampleSite/ -e notdevelopment --disableFastRender 
build:
    hugo --minify -s exampleSite/
css:
    pnpm run dev
css-build:
    pnpm run build