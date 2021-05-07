# Template for convenience script repos [![version](https://img.shields.io/github/release/hchiam/convenience)](https://github.com/hchiam/convenience/releases)

# **NOTE: EVERYTHING ABOVE THIS LINE IS MEANT TO BE EDITED**

With [`gh`](https://github.com/hchiam/learning-gh), you can quickly use this repo from CLI: `gh repo clone hchiam/convenience && cd convenience`. Everything else in this README.md is boilerplate. Delete this note section when ready. Consider whether you need to set code [linting](https://github.com/hchiam/learning-eslint-google). Consider whether you need to set up [Travis CI](https://github.com/hchiam/learning-travis) for automated testing of things like PRs. If you want to create a website fast, use a code generator instead, like [`create-next-app`](https://github.com/hchiam/learning-nextjs), [`sapper`](https://github.com/hchiam/learning-sapper), a [svelte template](https://github.com/sveltejs/template), or [`yo`](https://yeoman.io/generators).

# **NOTE: EVERYTHING BELOW THIS LINE IS MEANT TO BE EDITED**

[Live demo](https://codepen.io/hchiam/pen/...)

```js
https://cdn.jsdelivr.net/gh/hchiam/convenience@main/someFileName.js
```

```js
https://cdn.jsdelivr.net/gh/hchiam/convenience@1.0.0/someFileName.js
```

Example usage:

```js
...
```

CDN usage:

```html
<script
  src="https://cdn.jsdelivr.net/gh/hchiam/convenience@1.0.0/someFileName.js"
  integrity="sha384-L0ng4lphAnum3r1C57r1N9"
  crossorigin="anonymous"
></script>
```

<!-- uncomment the part with someFileName.js in get-integrity.sh and edit the file name as needed: -->

```bash
# get the thing to put into integrity="...":
bash get-integrity.sh
```
