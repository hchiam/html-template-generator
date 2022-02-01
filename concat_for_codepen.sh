# CSS:
cat codepen_only.css styles.css > ./CodePen/CSS.css

# HTML:
html=$(sed -n '/    <!-- copy to https:\/\/codepen.io\/hchiam\/pen\/jOBOaqm starting here -->/,/    <!-- copy to https:\/\/codepen.io\/hchiam\/pen\/jOBOaqm ending here -->/p' index.html | sed '1d;$d');
echo "$html" > ./CodePen/HTML.html

# JS:
cat codepen_only.js index.js helpers/*.js > ./CodePen/JS.js
