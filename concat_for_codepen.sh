# CSS:
cat codepen_only.css styles.css > ./CodePen/CSS.css

# HTML:
html=$(sed -n '/    <!-- copy to https:\/\/codepen.io\/hchiam\/pen\/jOBOaqm starting here -->/,/    <!-- copy to https:\/\/codepen.io\/hchiam\/pen\/jOBOaqm ending here -->/p' index.html | sed '1d;$d');
echo "$html" > ./CodePen/HTML.html
sed -i '' 's/template_demo.gif/https:\/\/raw.githubusercontent.com\/hchiam\/html-template-generator\/main\/template_demo.gif/g' ./CodePen/HTML.html

# JS:
cat codepen_only.js index.js helpers/*.js > ./CodePen/JS.js
