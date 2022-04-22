// $("body").on("keyup", function (event) {
//   if (hitTab(event)) {
//     $("body").attr("data-tab-user", true);
//   }
// });

function hitTab(event) {
  const key = event.key || event.code || event.keyCode || event.which || event;
  return key === "Tab" || key === 9;
}
