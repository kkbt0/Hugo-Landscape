dev:
    ~/kkbt.work/bin/hugo server -s exampleSite/ --disableFastRender
build:
    hugo --minify -s exampleSite/
css:
    npx tailwindcss -i ./assets/css/tailwind.in.css -o assets/css/tailwind.out.css --watch
css-build:
    npx tailwindcss -i ./assets/css/tailwind.in.css -o assets/css/tailwind.out.css

pf:
    ~/kkbt.work/bin/pagefind_extended --site exampleSite/public

update:
    ~/kkbt.work/bin/llrt scripts/version.js 

ec:
    bun run scripts/ec-code/dist/ec-code.js .

ec-build:
    cd scripts/ec-code/ && bun run build.js

ec-dev:
    bun run scripts/ec-code/src/index.js .