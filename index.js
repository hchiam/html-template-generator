/*
CONSIDER:

https://cdn.jsdelivr.net/gh/hchiam/clipboard@3.4.0/copyToClipboard.js

https://cdn.jsdelivr.net/gh/hchiam/draggable@master/makeElementDraggableAndEditable.js

*/

collapseButton($("#get_output_html_string"));
attachEventListeners();
setUpJSpreadsheet();
console.log("https://codepen.io/hchiam/pen/jOBOaqm");

function attachEventListeners() {
  $("body").on("click", ".copy-template", function () {
    copyTemplate(this);
    $("#output").show();
    $("#output_html_controls").hide();
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
    $("#output_html_controls").hide();
    $("#output_html_string").hide();
  });

  $("#get_output_html_string").on("click", function () {
    getOutputHtmlString();
    $("#output").hide();
    $("#output_html_controls").show();
    $("#output_html_string").show();
    revealButton($("#hide_output_html_string"));
    revealButton($("#export_html_file"));
    collapseButton($("#get_output_html_string"));
  });

  $("#hide_output_html_string").on("click", function () {
    $("#output").show();
    $("#output_html_controls").hide();
    $("#output_html_string").hide();
    revealButton($("#get_output_html_string"));
    collapseButton($("#hide_output_html_string"));
    collapseButton($("#export_html_file"));
  });

  $("#export_html_file").on("click", function () {
    saveHtmlFile($("#output_html_string pre").text());
  });

  $("#import_html_file").on("click", function () {
    $("#html_file_input").click(); // trigger file selector popup
  });

  $("#html_file_input").on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (readerEvent) => {
      const htmlString = readerEvent.target.result;
      const htmlStringWithCommentsAsDivs = htmlString.replace(
        /<!-- (.*?) -->/g,
        '<div class="notes-line remove-from-final-output">$1</div>'
      );
      const html = $(`<div>${htmlStringWithCommentsAsDivs}</div>`);
      html.find(".template-instance-container").append(
        `
        <div class="template-controls remove-from-final-output">
          <button class="copy-template">Copy template</button>
          <button class="delete-template">&nbsp;X&nbsp;</button>
        </div>
        <textarea
          class="notes remove-from-final-output"
          cols="55"
          rows="2"
          placeholder="Notes"
        ></textarea>
      `
      );

      // $("#output_html_string pre").text(htmlString);
      $("#output").html(
        `<span class="remove-from-final-output" hidden></span>${html.html()}`
      );

      $("#output").find("label, p").attr("contenteditable", true);
      $("#output")
        .find("select")
        .each(function () {
          const select = $(this);
          const options = select.find("option");
          const optionsString = Array.from(options)
            .map((o) => $(o).text())
            .join("\n");
          $(`
            <pre
              class="edit-select-options remove-from-final-output"
              contenteditable
            >${optionsString}</pre>
          `).insertAfter(select);
        });
      $("#output")
        .find(".template-instance-container")
        .each(function () {
          const templateInstanceContainer = $(this);
          commentsToTextarea(templateInstanceContainer);
        });

      $("#output").show();
      $("#output_html_controls").hide();
      $("#output_html_string").hide();
      revealButton($("#get_output_html_string"));
      collapseButton($("#hide_output_html_string"));
      collapseButton($("#export_html_file"));
    };
  });

  $("#export_requirements").on("click", function () {
    alert(
      'This button "Export requirements" will be worked on if requested. \n\nMaybe an excel sheet will be exported. \n\nMaybe we can use jspreadsheet, which works like excel in your browser. \n\n'
    );
  });

  $("#import_requirements").on("click", function () {
    alert(
      'This button "Import requirements" will be worked on if requested. \n\nMaybe an excel sheet can be imported. \n\nOr maybe we can let users import from excel into jspreadsheet in the browser. \n\n'
    );
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

  const destinationElement = $(
    isExample ? lastTemplateInOutputContainer : templateContainer
  ).next();

  destinationElement.css("visibility", "hidden");
  $("#output").ready(function () {
    animateMove(templateContainer, destinationElement);
  });

  stopFlashingColorAfterHoveredAClone();
  clearOutputHtmlString();
  revealButton($("#get_output_html_string"));
}

function fillTemplateWith(thisHtml) {
  $("template").html(thisHtml);
}

function editSelectOptions(pre) {
  const preText = $(pre)
    .html()
    .replaceAll("<br>", "\n")
    .replaceAll("<br/>", "\n")
    .trim();
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
  const outputOriginal = $("#output");
  let outputClone = $("<div>").append($("#output").clone());
  outputClone.find(".remove-from-final-output:not(.notes)").remove();

  const notesClone = outputClone.find(".notes");
  const notes = outputOriginal.find(".notes");
  notes.each((index, value) => {
    const note = $(value);
    const noteAnchor = $(notesClone[index]).prev();
    const noteText = note
      .val()
      .trim()
      .split("\n")
      .map((x) => `<!-- ${x} -->`)
      .join("\n");
    $(noteText).insertAfter(noteAnchor);
  });
  outputClone.find(".notes").remove();

  outputClone.find("[contenteditable]").removeAttr("contenteditable");
  outputClone = formattedHtml(outputClone.find("#output").html());

  $("#output_html_string pre").text(outputClone);

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

function formattedHtml(htmlString, tabString = "\t") {
  const newLines = /(\r\n|\n|\r)/gm;
  const repeatedSpaces = / +(?= )/g;

  function parse(htmlString, numberOfTabs = 0) {
    htmlString = $.parseHTML(htmlString);
    let outputString = "";

    function getTabs() {
      return tabString.repeat(numberOfTabs);
    }

    $.each(htmlString, function (i, el) {
      const isTextNode = el.nodeName == "#text";
      const isCommentNode = el.nodeName == "#comment";
      if (isTextNode) {
        const hasText = $(el).text().trim().length;
        if (hasText) {
          outputString += getTabs() + $(el).text().trim() + "\n";
        }
      } else if (isCommentNode) {
        const commentText = el.nodeValue.trim();
        if (commentText) {
          outputString += getTabs() + "<!-- " + commentText + " -->" + "\n";
        }
      } else {
        const innerHTML = $(el).html().trim();

        $(el).html(innerHTML.replace(newLines, "").replace(repeatedSpaces, ""));

        const needToRecursivelyParse = $(el).children().length;
        if (needToRecursivelyParse) {
          $(el).html("\n" + parse(innerHTML, numberOfTabs + 1) + getTabs());
        }

        const outerHTML = $(el).prop("outerHTML").trim();
        outputString += getTabs() + outerHTML + "\n";
      }
    });

    return outputString;
  }

  return parse(htmlString.replace(newLines, " ").replace(repeatedSpaces, ""));
}

function commentsToTextarea(templateInstanceContainer) {
  const selectorCommentsTurnedIntoDivs = ".notes-line";
  const comments = templateInstanceContainer.find(
    selectorCommentsTurnedIntoDivs
  );
  const noteString = Array.from(comments)
    .map((c) => $(c).text())
    .join("\n");
  const notes = templateInstanceContainer.find(".notes");
  notes.val(noteString);
  templateInstanceContainer.ready(function () {
    comments.remove();
  });
}

function saveHtmlFile(html) {
  try {
    const date = new Date().toDateString().replaceAll(" ", "_");
    const fileName = `html_template_generator_${date}.html`;
    const tempElem = document.createElement("a");
    // use encodeURIComponent instead of urlAcceptableString since saving to file
    tempElem.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(html)
    );
    tempElem.setAttribute("download", fileName);
    if (document.createEvent) {
      const event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      tempElem.dispatchEvent(event);
    } else {
      tempElem.click();
    }
  } catch (err) {
    window.open("data:text/txt;charset=utf-8," + escape(html), "newdoc");
  }
}

function animateMove(originJQueryElement, destinationJQueryElement) {
  destinationJQueryElement.css("visibility", "hidden");
  const original = $(originJQueryElement);
  const originPosition = original.position();
  const originalWidth = original.outerWidth();
  const originalHeight = original.outerHeight();
  const destinationPosition = $(destinationJQueryElement).position();
  const destinationWidth = $(destinationJQueryElement).outerWidth();
  const destinationHeight = $(destinationJQueryElement).outerHeight();
  const temp = original.clone();
  $("body").append(temp);
  temp.addClass("disable-hover").find("*").css({ pointerEvents: "none" });
  temp
    .css({
      position: "fixed",
      zIndex: 1,
      width: originalWidth,
      height: originalHeight,
    })
    .offset(originPosition)
    .animate({
      left: destinationPosition.left,
      top: destinationPosition.top,
      width: destinationWidth,
      height: destinationHeight,
    });
  setTimeout(() => {
    temp.remove();
    $(destinationJQueryElement).css("visibility", "visible");
  }, 1000);
}

function setUpJSpreadsheet() {
  const defaultData = [
    ["id", "input box", true, "label", "note"],
    ["", "dropdown", false, "", ""],
    [],
  ];

  const columnDefinitions = [
    { type: "text", title: "ID", width: 125 },
    {
      type: "dropdown",
      title: "Type of input",
      width: 125,
      source: [
        "input box",
        "dropdown",
        "checkbox",
        "radio",
        "paragraph",
        "other",
      ],
    },
    { type: "checkbox", title: "Required", width: 125 },
    { type: "text", title: "Label", width: 125 },
    { type: "text", title: "Note", width: 125 },
  ];

  let spreadsheet = jspreadsheet(document.getElementById("spreadsheet"), {
    data: defaultData,
    columns: columnDefinitions,
  });

  $("#export_sheet").on("click", function () {
    spreadsheet.download();
  });

  $("#import_sheet").on("click", function () {
    $("#csv_file_input").click();
  });

  $("#csv_file_input").on("change", function (e) {
    const file = e.target.files[0];
    // alert(file);
    // spreadsheet = jspreadsheet(document.getElementById("spreadsheet"), {
    //   csv: file,
    //   csvHeaders: true,
    //   tableOverflow: true,
    //   columns: columnDefinitions,
    // });
  });
}
