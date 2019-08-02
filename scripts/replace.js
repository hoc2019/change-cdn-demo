const path = require("path");
const fs = require("fs-extra");
const replace = require("replace-in-file");

const { cdnList, cdnUrl } = require("../project.json");

const createReplaceOptions = (dir, cdn) => {
  return {
    files: `${path.resolve(__dirname, `../build/static/${dir}${cdn}/`)}/*.*`,
    from: new RegExp(`${cdnUrl.Default}`, "g"),
    to: cdnUrl[cdn]
  };
};

const createCopy = (dir, cdn) => {
  return fs
    .copy(
      path.resolve(__dirname, `../build/static/${dir}`),
      path.resolve(__dirname, `../build/static/${dir}${cdn}`)
    )
    .then(() => {
      const options = createReplaceOptions(dir, cdn);
      return replace(options)
        .then(results => {
          console.log("Replacement results:", results);
        })
        .catch(error => {
          console.error("Error occurred:", error);
        });
    });
};

cdnList.forEach(item => {
  const jsCopy = createCopy("js", item);
  const cssCopy = createCopy("css", item);
  Promise.all([jsCopy, cssCopy])
    .then(() => console.log("success!"))
    .catch(err => console.error(err));
});
