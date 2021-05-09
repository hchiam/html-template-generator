/*
CONSIDER:

https://cdn.jsdelivr.net/gh/hchiam/clipboard@3.4.0/copyToClipboard.js

https://cdn.jsdelivr.net/gh/hchiam/draggable@master/makeElementDraggableAndEditable.js

*/

collapseButton($("#get_output_html_string"));
attachEventListeners();

function attachEventListeners() {
  $("body").on("click", ".copy-template", function () {
    copyTemplate(this);
    $("#output").show();
    $("#output_html_string").hide();
  });

  $("body").on("click", ".delete-template", function () {
    deleteTemplateInstance(this);
  });

  $("body").on("keyup", ".edit-select-options", function () {
    editSelectOptions(this);
  });

  $(".copy-dynamic-template").on("click", function () {
    copyDynamicTemplate(this);
    $("#output").show();
    $("#output_html_string").hide();
  });

  $("#get_output_html_string").on("click", function () {
    getOutputHtmlString();
    $("#output").hide();
    $("#output_html_string").show();
    revealButton($("#hide_output_html_string"));
    collapseButton($("#get_output_html_string"));
  });

  $("#hide_output_html_string").on("click", function () {
    $("#output").show();
    $("#output_html_string").hide();
    revealButton($("#get_output_html_string"));
    collapseButton($("#hide_output_html_string"));
  });
}

function deleteTemplateInstance(button) {
  const isExample = $(button).parents("#examples").length > 0;
  if (isExample) return;
  $(button).parents(".template-instance-container").remove();
  clearOutputHtmlString();
  const isOutputEmpty = !$("#output").find(":not(.remove-from-final-output)")
    .length;
  if (isOutputEmpty) {
    collapseButton($("#get_output_html_string"));
  }
}

function copyDynamicTemplate(button) {
  const templateContainer = $(button).parents(".template-generator");
  let templateHtmlLiteral = templateContainer
    .find("pre")
    .text()
    .replaceAll("<br>", "\n")
    .trim();
  templateHtmlLiteral = `<div class="template-instance-container">
${templateHtmlLiteral}
<div class="template-controls remove-from-final-output">
<button class="copy-template">Copy template</button>
<button class="delete-template">&nbsp;X&nbsp;</button>
</div>
<textarea class="notes remove-from-final-output" cols="55" rows="2" placeholder="Notes"></textarea>
</div>`;

  const lastTemplateContainer = $("#output")
    .find(".template-instance-container")
    .last();
  const lastTemplateInOutputContainer = lastTemplateContainer.length
    ? lastTemplateContainer
    : $("#output").children().first();

  fillTemplateWith(templateHtmlLiteral);
  const template = $("template")[0];
  const clone = template.content.cloneNode(true);

  $(clone).insertAfter(lastTemplateInOutputContainer);

  stopFlashingColorAfterHoveredAClone();
  clearOutputHtmlString();
  revealButton($("#get_output_html_string"));
}

function copyTemplate(button) {
  const isExample = $(button).parents("#examples").length > 0;

  const templateContainer = $(button).parents(".template-instance-container");

  const lastTemplateContainer = $("#output")
    .find(".template-instance-container")
    .last();
  const lastTemplateInOutputContainer = lastTemplateContainer.length
    ? lastTemplateContainer
    : $("#output").children().first();

  const thisHtml = `<div class="template-instance-container">${templateContainer.html()}</div>`;
  fillTemplateWith(thisHtml);
  const template = $("template")[0];
  const clone = template.content.cloneNode(true);

  $(clone).insertAfter(
    isExample ? lastTemplateInOutputContainer : templateContainer
  );

  stopFlashingColorAfterHoveredAClone();
  clearOutputHtmlString();
  revealButton($("#get_output_html_string"));
}

function fillTemplateWith(thisHtml) {
  $("template").html(thisHtml);
}

function editSelectOptions(pre) {
  const preText = $(pre).html().replaceAll("<br>", "\n").trim();
  const options = preText.split("\n");
  const select = $(pre).prev();
  const newOptionsHtml = options
    .map((x) => `<option value="${x}">${x}</option>`)
    .join("");
  select.html(newOptionsHtml);
}

function clearOutputHtmlString() {
  $("#output_html_string pre").text("");
}

function getOutputHtmlString() {
  let output = $("<div>").append($("#output").clone());
  output.find(".remove-from-final-output").remove();
  output = output.find("#output").html();
  $("#output_html_string pre").text(output);

  // // Keep this just in case I need to revert to a different UI design:
  // setTimeout(() => {
  //   scrollToBottomOfElement($("#output_html_string pre"));
  // }, 200);
}

function scrollToBottomOfElement(jQueryElement) {
  const newScrollPosition =
    jQueryElement[0].scrollHeight + jQueryElement[0].offsetHeight;
  window.scrollTo(0, newScrollPosition);
}

function stopFlashingColor() {
  $(":root").css("--flash-background", "black");
  $(":root").css("--flash-color", "white");
  $(":root").remove("--flash-background");
  $(":root").remove("--flash-color");
}

let stoppedFlashingColor = false;
const secondsUntilStopShowingFlash = 5;
function stopFlashingColorAfterHoveredAClone() {
  $("#output")
    .find(".template-instance-container")
    .on("mouseenter", function () {
      if (!stoppedFlashingColor) {
        stoppedFlashingColor = true;
        setTimeout(() => {
          stopFlashingColor();
        }, secondsUntilStopShowingFlash * 1000);
      }
    });
}

function revealButton(jQueryButton) {
  jQueryButton.addClass("show flash-of-color").removeClass("hide");

  setTimeout(() => {
    jQueryButton.removeClass("flash-of-color");
  }, 2000);
}

function collapseButton(jQueryButton) {
  jQueryButton.addClass("hide").removeClass("show");
}
