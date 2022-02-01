makeInputLabelsSmarter("radio");
makeInputLabelsSmarter("checkbox");

$("body").on("click", ".copy-template", function () {
  setTimeout(function () {
    makeInputLabelsSmarter("radio");
    makeInputLabelsSmarter("checkbox");
  }, 0);
});

function makeInputLabelsSmarter(type, inputLabels) {
  (inputLabels || $(`input[type="${type}"] + label`)).each(function () {
    const inputLabel = $(this);
    inputLabel.off("keyup").on("keyup", function (event) {
      if (hitEnter(event)) {
        appendInputAndLabel(type, inputLabel);
      } else if (hitBackspaceOrDelete(event)) {
        removeInputAndLabel(inputLabel);
      }
    });
  });
}

function hitEnter(event) {
  const key = event.key || event.code || event.keyCode || event.which || event;
  return key === "Enter" || key === "ENTER" || key === 13;
}

function hitBackspaceOrDelete(event) {
  const key = event.key || event.code || event.keyCode || event.which || event;
  return key === "Backspace" || key === "Delete" || key === 8 || key === 46;
}

/**
 * assumes `<li><input><label></label></li>`
 */
function appendInputAndLabel(type, inputLabel) {
  const currentRow = inputLabel.parent("li");
  const preAndPostBreak = currentRow
    .find("label")
    .html()
    .replace(/&nbsp;/g, " ")
    .split("<br>");
  const preBreak = preAndPostBreak[0];
  const postBreak = preAndPostBreak[1];

  currentRow.find("label").text(preBreak);

  currentRow.after(`<li style="list-style: none">
  <input id="_" type="${type}" name="" />
  <label for="" name="" contenteditable
    >${postBreak || "Editable input label"}</label
  >
</li>`);

  const newRow = currentRow.next();
  newRow.find("label").text(postBreak).focus();
  makeInputLabelsSmarter(type, newRow.find("label"));
}

/**
 * assumes `<li><input><label></label></li>`
 */
function removeInputAndLabel(inputLabel) {
  const currentRow = inputLabel.parent("li");
  const previousRow = currentRow.prev("li");
  const nextRow = currentRow.next("li");

  const hasText = inputLabel.text() !== "";
  const cursorPosition = getCursorPosition();
  const willCombine = hasText && cursorPosition === 0 && previousRow.length;
  const willDelete = !hasText;

  if (willCombine || willDelete) {
    if (previousRow.length) {
      previousRow.find("label").focus();
    } else {
      nextRow.find("label").focus();
    }
    if (!isLastInputLabelInTemplate(currentRow)) {
      currentRow.remove();
    }
  }

  if (willCombine) {
    const endPositionOfPreviousText = previousRow.find("label").text().length;
    previousRow
      .find("label")
      .text(previousRow.find("label").text() + inputLabel.text());
    setCursorPosition(previousRow.find("label"), endPositionOfPreviousText);
  }
}

function isLastInputLabelInTemplate(inputLabel) {
  return (
    inputLabel.parents(".template-instance-container").find("label").length ===
    1
  );
}

function getCursorPosition() {
  return window.getSelection().getRangeAt(0).endOffset;
}

function setCursorPosition(jQueryElement, cursorPosition) {
  if (!jQueryElement[0]) return;

  const range = document.createRange();
  const sel = window.getSelection();

  range.setStart(jQueryElement[0].childNodes[0], cursorPosition);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}
