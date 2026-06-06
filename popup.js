document.addEventListener("DOMContentLoaded", () => {
  const floorInput = document.getElementById("floor");
  const floorRange = document.getElementById("floorRange");
  const scaleInput = document.getElementById("scaleFactor");
  const scaleRange = document.getElementById("scaleRange");
  const saveBtn = document.getElementById("save");
  const resetBtn = document.getElementById("reset");

  function syncInputs(input, range) {
    input.addEventListener("input", () => (range.value = input.value));
    range.addEventListener("input", () => (input.value = range.value));
  }
  syncInputs(floorInput, floorRange);
  syncInputs(scaleInput, scaleRange);

  browser.storage.local.get(["floor", "scaleFactor"]).then((result) => {
    floorInput.value = result.floor ?? 0.008;
    floorRange.value = result.floor ?? 0.008;
    scaleInput.value = result.scaleFactor ?? 2.5;
    scaleRange.value = result.scaleFactor ?? 2.5;
  });

  saveBtn.addEventListener("click", () => {
    const floor = parseFloat(floorInput.value) || 0.008;
    const scaleFactor = parseFloat(scaleInput.value) || 2.5;
    browser.storage.local.set({ floor, scaleFactor }).then(() => {
      window.close();
    });
  });

  resetBtn.addEventListener("click", () => {
    browser.storage.local.set({ floor: 0.008, scaleFactor: 2.5 }).then(() => {
      floorInput.value = 0.008;
      floorRange.value = 0.008;
      scaleInput.value = 2.5;
      scaleRange.value = 2.5;
    });
  });
});
