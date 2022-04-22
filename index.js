/*
CONSIDER:

https://cdn.jsdelivr.net/gh/hchiam/clipboard@3.4.0/copyToClipboard.js

https://cdn.jsdelivr.net/gh/hchiam/draggable@master/makeElementDraggableAndEditable.js

*/

attachEventListeners();
const examples = $("#examples");
const templates = [
  "input",
  "radio",
  "checkbox",
  "dropdown",
  "paragraph",
  "email",
  "password",
  "date",
  "gender",
  "state",
  "file",
  "number",
  "slider",
  "other",
];
const templateMap = {};
templates.forEach((template) => {
  const foundTemplate = examples.find(`.${template}-template`);
  templateMap[template] =
    foundTemplate.length > 0
      ? foundTemplate.find(".copy-template")
      : examples.find(".paragraph-template").find(".copy-template");
});
const spreadsheet = setUpJSpreadsheet();
console.log("https://codepen.io/hchiam/pen/jOBOaqm");
console.log("https://github.com/hchiam/html-template-generator/issues");
getVersionNumber((version) => {
  showVersionNumber(version);
  const accentColour = getAccentColourFromVersion(version);
  $(":root").css("--accent-colour", accentColour);
});
const secondsToShowIntroGif = 15000;
setTimeout(() => {
  $("#examples").click();
}, secondsToShowIntroGif);
removeStylingFromPastedText();

function attachEventListeners() {
  $("body").on("click", ".copy-template", function () {
    $("#output").attr("data-animating", true);
    copyTemplate(this);
    $("#output").show();
    $("#output_html_controls").hide();
    $("#output_html_string").hide();
    revealButton($(".export-html-file"));
    generateSheetFromHtml();
  });

  $("body").on("click", ".toggle-template-display", function (event) {
    const button = $(event.target);
    const template = button.closest(".template-instance-container");
    const display = template.css("display");
    if (display === "inline-block") {
      button.prop("aria-label", "make template use block display");
      template.css("display", "block");
    } else {
      button.prop("aria-label", "make template use inline-block display");
      template.css("display", "inline-block");
    }
    generateSheetFromHtml();
  });

  $("body").on("click", ".move-template-earlier", function () {
    moveContainerEarlier(this, generateSheetFromHtml);
  });

  $("body").on("click", ".move-template-later", function () {
    moveContainerLater(this, generateSheetFromHtml);
  });

  $("body").on("click", ".delete-template", function () {
    deleteTemplateInstance(this);
    generateSheetFromHtml();
  });

  document.execCommand("defaultParagraphSeparator", false, "br");
  $("body").on("keyup", ".edit-select-options", function () {
    editSelectOptions(this);
    generateSheetFromHtml();
  });

  $("body").on(
    "keyup",
    "#output [contenteditable], #output .notes",
    function () {
      generateSheetFromHtml();
    }
  );

  $(".copy-dynamic-template").on("click", function () {
    copyDynamicTemplate(this);
    $("#output").show();
    $("#output_html_controls").hide();
    $("#output_html_string").hide();
    generateSheetFromHtml();
  });

  $("#export_html_file, .export-html-file").on("click", function () {
    getOutputHtmlString();
    saveHtmlFile($("#output_html_string pre").text());
  });

  $("#template_demo_container").on("click", hideIntroGif);
}

function deleteTemplateInstance(button) {
  const isExample = $(button).closest("#examples").length > 0;
  if (isExample) return;
  $(button).closest(".template-instance-container").remove();
  clearOutputHtmlString();
}

function copyDynamicTemplate(button) {
  const templateContainer = $(button).closest(".template-generator");
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

  const clone = cloneTemplateWith(templateHtmlLiteral);

  $(clone).insertAfter(lastTemplateInOutputContainer);

  stopFlashingColorAfterHoveredAClone();
  clearOutputHtmlString();
}

function copyTemplate(button, extraData, animationTime = 100) {
  const isExample = $(button).closest("#examples").length > 0;

  const templateContainer = $(button).closest(".template-instance-container");

  const lastTemplateContainer = $("#output")
    .find(".template-instance-container")
    .last();
  const lastTemplateInOutputContainer = lastTemplateContainer.length
    ? lastTemplateContainer
    : $("#output").children().first();

  const thisHtml = `<div class="${templateContainer.prop(
    "class"
  )}">${templateContainer.html()}</div>`;

  const clone = cloneTemplateWith(thisHtml);

  $(clone).insertAfter(
    isExample ? lastTemplateInOutputContainer : templateContainer
  );

  const lastNewTemplateContainer = $("#output")
    .find(".template-instance-container")
    .last();

  if (extraData) {
    useExtraData(lastNewTemplateContainer, extraData);
  }

  const destinationElement = $(
    isExample ? lastTemplateInOutputContainer : templateContainer
  ).next();

  const note = templateContainer.find(".notes").val();
  if (note) {
    destinationElement.find(".notes").val(note);
  }

  destinationElement.css("visibility", "hidden");

  const allNextElements = destinationElement.next(
    ".template-instance-container"
  );
  allNextElements
    .css({
      position: "relative",
      top: -destinationElement.height(),
    })
    .animate(
      {
        top: 0,
      },
      animationTime
    );
  $("#output").ready(function () {
    animateMove(templateContainer, destinationElement, animationTime);
  });

  stopFlashingColorAfterHoveredAClone();
  clearOutputHtmlString();
}

function cloneTemplateWith(thisHtml) {
  fillTemplateWith(thisHtml);
  const template = $("template")[0];
  const clone = template.content.cloneNode(true);
  return clone;
}

function fillTemplateWith(thisHtml) {
  $("template").html(thisHtml);
}

function useExtraData(jQueryTemplateClone, extraData) {
  const { id, type, required, display, texts, note } = extraData;

  const textElements = [...jQueryTemplateClone.find("p, label, pre")];
  const ids = jQueryTemplateClone.find("[id]");
  const fors = jQueryTemplateClone.find("[for]");
  const hasOneInput = ids.length === 1;
  const hasMultipleInputs = ids.length > 1;

  if (id) {
    if (hasOneInput) {
      ids.prop("id", id);
      fors.prop("for", id);
    } else if (hasMultipleInputs) {
      ids.each((index, element) => {
        $(element).prop("id", id + "-" + (index + 1));
      });
      fors.each((index, element) => {
        $(element).prop("for", id + "-" + (index + 1));
      });
    }
  }

  if ("required" in extraData) {
    ids
      .toggleClass("isRequired", required)
      .toggleClass("notRequired", !required);
  }

  jQueryTemplateClone.css("display", display);

  if (texts) {
    texts.split(", ").forEach((text, index) => {
      if (textElements[index]) {
        textElements[index].innerText = text;
        switch (type) {
          case "radio":
          case "checkbox":
            makeInputLabelsSmarter(type);
            $(textElements[index]).on("click", function (e) {
              e.preventDefault(); // prevent click on label from selecting radio/checkbox
            });
            break;
        }
      } else {
        // could be creating more inputs for radio / checkbox / dropdown:
        switch (type) {
          case "radio":
            const radioHtml = $(".radio-template ul li:last-child")[0]
              .outerHTML;
            const radioHtmlClone = $(cloneTemplateWith(radioHtml));
            radioHtmlClone.find("label").text(text);
            radioHtmlClone.appendTo(jQueryTemplateClone.find("ul"));
            break;
          case "checkbox":
            const checkboxHtml = $(".checkbox-template ul li:last-child")[0]
              .outerHTML;
            const checkboxHtmlClone = $(cloneTemplateWith(checkboxHtml));
            checkboxHtmlClone.find("label").text(text);
            checkboxHtmlClone.appendTo(jQueryTemplateClone.find("ul"));
            break;
          case "dropdown":
          case "gender":
          case "state":
            // append to contenteditable text
            const pre = jQueryTemplateClone.find("pre.edit-select-options");
            // const options = texts.split(", ").slice(1);
            pre.text(pre.text() + "\n" + text);
            editSelectOptions(pre);
            break;
        }
      }
    });
  }

  if (note) {
    jQueryTemplateClone.find(".notes").val(note);
  }
}

function editSelectOptions(pre) {
  const preText = $(pre)
    .html()
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "")
    .replaceAll("<br>", "\n")
    .replaceAll("<br/>", "\n")
    .replace(/<div>(.+?)<\/div>/g, "\n$1")
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

  $("#output_html_string pre")
    .text(outputClone)
    .ready(() => {
      createElementToClickToCopyToClipboard(
        $("#output_html_string")[0],
        outputClone,
        () => {
          alert("Copied code to clipboard!");
        }
      );
      $("#output_html_string pre").css("visibility", "visible");
    });
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
    const date = new Date();
    const dateString = date.toDateString().replaceAll(" ", "_");
    const timeString = `${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
    const fileName = `html_template_generator_${dateString}_${timeString}.html`;
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

function animateMove(
  originJQueryElement,
  destinationJQueryElement,
  animationTime = 100
) {
  destinationJQueryElement.css("visibility", "hidden");
  const original = $(originJQueryElement);
  const originalMarginLeft = parseInt(original.css("marginLeft"));
  const originalMarginTop = parseInt(original.css("marginTop"));
  const originPosition = original.position();
  originPosition.left = originPosition.left + originalMarginLeft;
  originPosition.top = originPosition.top + originalMarginTop;
  const originalWidth = original.outerWidth();
  const originalHeight = original.outerHeight();
  const destinationPosition = $(destinationJQueryElement).position();
  const destinationWidth = $(destinationJQueryElement).outerWidth();
  const destinationHeight = $(destinationJQueryElement).outerHeight();
  const temp = original.clone();
  $("body").append(temp);
  temp.addClass("temp");
  temp.addClass("disable-hover").find("*").css({ pointerEvents: "none" });
  temp
    .css({
      position: "fixed",
      zIndex: 1,
      width: originalWidth,
      height: originalHeight,
    })
    .offset(originPosition)
    .animate(
      {
        left: destinationPosition.left,
        top: destinationPosition.top,
        width: destinationWidth,
        height: "auto", // destinationHeight,
      },
      animationTime
    );
  setTimeout(() => {
    temp.remove();
    $(destinationJQueryElement).css("visibility", "visible");
    $("#output").removeAttr("data-animating", "");
  }, animationTime * 10);
}

function setUpJSpreadsheet() {
  const defaultData = [[]];
  const columnDefinitions = [
    { type: "text", title: "ID", width: 125 },
    {
      type: "dropdown",
      title: "Type of input",
      width: 125,
      source: templates,
    },
    { type: "checkbox", title: "Required", width: 125 },
    { type: "text", title: "Display Mode", width: 125 },
    { type: "text", title: "Texts", width: 200 },
    { type: "text", title: "Note", width: 125 },
  ];

  let spreadsheet = jspreadsheet(document.getElementById("spreadsheet"), {
    data: JSON.parse(JSON.stringify(defaultData)),
    columns: JSON.parse(JSON.stringify(columnDefinitions)),
    contextMenu: setUpJSpreadsheetContextMenu,
    onchange: generateHtmlFromSheet,
  });

  $("#export_sheet").on("click", function () {
    spreadsheet.download();
  });

  function resetSheet() {
    const clonedDefaultData = JSON.parse(JSON.stringify(defaultData));
    spreadsheet.setData(clonedDefaultData);
  }

  const oldGetHeaders = spreadsheet.getHeaders;

  spreadsheet.resetSheet = resetSheet;
  spreadsheet.getHeaders = () => oldGetHeaders().split(",");
  spreadsheet.getRows = spreadsheet.getData;
  return spreadsheet;
}

function setUpJSpreadsheetContextMenu(obj, x, y, e) {
  const items = [];

  if (y == null) {
    if (obj.options.allowInsertColumn == true) {
      items.push({
        title: obj.options.text.insertANewColumnBefore,
        onclick: function () {
          obj.insertColumn(1, parseInt(x), 1);
        },
      });
      items.push({
        title: obj.options.text.insertANewColumnAfter,
        onclick: function () {
          obj.insertColumn(1, parseInt(x), 0);
        },
      });
    }

    if (obj.options.allowDeleteColumn == true) {
      items.push({
        title: obj.options.text.deleteSelectedColumns,
        onclick: function () {
          obj.deleteColumn(
            obj.getSelectedColumns().length ? undefined : parseInt(x)
          );
          generateHtmlFromSheet();
        },
      });
    }

    if (obj.options.allowRenameColumn == true) {
      items.push({
        title: obj.options.text.renameThisColumn,
        onclick: function () {
          obj.setHeader(x);
          generateHtmlFromSheet();
        },
      });
    }

    if (obj.options.columnSorting == true) {
      items.push({ type: "line" });

      items.push({
        title: obj.options.text.orderAscending,
        onclick: function () {
          obj.orderBy(x, 0);
          generateHtmlFromSheet();
        },
      });
      items.push({
        title: obj.options.text.orderDescending,
        onclick: function () {
          obj.orderBy(x, 1);
          generateHtmlFromSheet();
        },
      });
    }
  } else {
    if (obj.options.allowInsertRow == true) {
      items.push({
        title: obj.options.text.insertANewRowBefore,
        onclick: function () {
          obj.insertRow(1, parseInt(y), 1);
        },
      });

      items.push({
        title: obj.options.text.insertANewRowAfter,
        onclick: function () {
          obj.insertRow(1, parseInt(y));
        },
      });
    }

    if (obj.options.allowDeleteRow == true) {
      items.push({
        title: obj.options.text.deleteSelectedRows,
        onclick: function () {
          obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
          generateHtmlFromSheet();
        },
      });
    }

    if (x) {
      if (obj.options.allowComments == true) {
        items.push({ type: "line" });

        var title = obj.records[y][x].getAttribute("title") || "";

        items.push({
          title: title
            ? obj.options.text.editComments
            : obj.options.text.addComments,
          onclick: function () {
            obj.setComments([x, y], prompt(obj.options.text.comments, title));
          },
        });

        if (title) {
          items.push({
            title: obj.options.text.clearComments,
            onclick: function () {
              obj.setComments([x, y], "");
            },
          });
        }
      }
    }
  }

  items.push({ type: "line" });

  if (obj.options.allowExport) {
    items.push({
      title: obj.options.text.saveAs,
      shortcut: "Ctrl + S",
      onclick: function () {
        obj.download();
      },
    });
  }

  return items;
}

function generateSheetFromHtml() {
  // TODO: need to handle options, labels, width state, etc.

  // id, type, required, display, texts, note
  const newData = []; // example: [["id1", "input", true, true, "Name:", "Some notes."]]

  const usedTemplateContainers = $("#output .template-instance-container");

  usedTemplateContainers.each(function () {
    const container = $(this);
    const input = container.find("[id]");
    const id = input.prop("id");
    const type = container
      .prop("class")
      .replace("template-instance-container", "")
      .trim()
      .replace("-template", "");
    const required = input.hasClass("isRequired");
    const display = container.css("display");
    const texts = Array.from(container.find("p, label, pre"))
      .map((x) => {
        console.log(x.innerHTML);
        const parsed = x.innerHTML
          .replaceAll("<div>", ", ")
          .replaceAll("</div>", "")
          .replaceAll("<br>", ", ")
          .replaceAll("<br/>", ", ")
          .replaceAll("\n", ", ")
          .replaceAll("&nbsp;", " ");
        return parsed;
      })
      .filter((hasValue) => hasValue)
      .join(", ");

    const note = container.find(".notes").val();

    newData.push([id, type, required, display, texts, note]);
  });

  if (!newData.length) newData.push([]);

  spreadsheet.setData(newData);
}

function generateHtmlFromSheet() {
  // TODO: need to handle options, labels, width state, etc.
  const headersArray = spreadsheet.getHeaders();
  const dataRows = spreadsheet.getRows();

  $("#output").html('<span class="remove-from-final-output" hidden></span>');
  $("#output_html_controls").hide();
  $("#output_html_string").hide();

  const idColumn = headersArray.indexOf("ID");
  const inputTypeColumn = headersArray.indexOf("Type of input");
  const requiredColumn = headersArray.indexOf("Required");
  const displayColumn = headersArray.indexOf("Display Mode");
  const noteColumn = headersArray.indexOf("Note");
  const textColumn = headersArray.indexOf("Texts");
  const inputs = dataRows.map((r) => r[inputTypeColumn]).filter((x) => x);

  const animationTime = 0;

  const previousScrollTop = $("#output").scrollTop();

  $("#output").animate({ scrollTop: previousScrollTop }, animationTime);
  inputs.map((input, index) => {
    const template = templateMap[input];
    const row = dataRows[index];
    const extraData = {
      id: row[idColumn],
      type: row[inputTypeColumn],
      required: row[requiredColumn],
      display: row[displayColumn],
      note: row[noteColumn],
      texts: row[textColumn],
    };
    setTimeout(() => {
      copyTemplate(template, extraData, animationTime);
      const isLastInput = index === inputs.length - 1;
      if (isLastInput) {
        $("#output").animate({ scrollTop: previousScrollTop }, animationTime);
      }
    }, animationTime * index);
    revealButton($(".export-html-file"));
  });
}

function moveContainerEarlier(button, callback) {
  const templateContainer = $(button).closest(".template-instance-container");
  const destinationElement = templateContainer.prev(
    ".template-instance-container"
  );

  if (!destinationElement.length) return;

  $("#output").ready(function () {
    animateMove(templateContainer, destinationElement);
    animateMove(destinationElement, templateContainer);
    templateContainer.insertBefore(destinationElement);
    if (callback) callback();
  });
}

function moveContainerLater(button, callback) {
  const templateContainer = $(button).closest(".template-instance-container");
  const destinationElement = templateContainer.next(
    ".template-instance-container"
  );

  if (!destinationElement.length) return;

  $("#output").ready(function () {
    animateMove(templateContainer, destinationElement);
    animateMove(destinationElement, templateContainer);
    templateContainer.insertAfter(destinationElement);
    if (callback) callback();
  });
}

function showVersionNumber(versionNumber) {
  $(".version-number-container .version-number-link").text(
    `You're using version ${versionNumber}`
  );
  $("#no_mobile_message .version-number-link").text(
    `as of version ${versionNumber}`
  );
}

function getVersionNumber(callback) {
  fetch("https://api.github.com/repos/hchiam/html-template-generator/releases")
    .then((r) => r.json())
    .then((r) => {
      if (callback) callback(r[0].name);
    });
}

function getAccentColourFromVersion(version) {
  const number = Number(version.replaceAll(".", ""));
  const colours = [
    "orange",
    "coral",
    "yellow",
    "lime",
    "lightgreen",
    "aqua",
    "lightblue",
  ];
  const index = number % colours.length;
  return colours[index];
}

function hideIntroGif() {
  $("#template_demo_container").hide();
}

function removeStylingFromPastedText() {
  $(window).on("paste", function (event) {
    event.preventDefault();
    var data = event.originalEvent.clipboardData.getData("Texts");
    document.execCommand("insertText", false, data);
  });
}
