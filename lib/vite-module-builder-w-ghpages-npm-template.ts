// do not combile a default export AND named exports in the same file
// because consumers of your bundle will have to use `my-bundle.default`
// to access the default export, which may not be what you want.
// Use `output.exports: "named"` to disable this warning.

function init(message: string): void {
  console.log(message);
  const messageOutputElement = document.getElementById("messageOutput");
  if (messageOutputElement) {
    messageOutputElement.innerHTML = message;
  }

}
export default {
  init: init
}
