import path from "path";

export default {
  test: {
    setupFiles: ["./test/setup-tests.js"],
    watchExclude: [path.resolve(__dirname, "test_data")],
    fileParallelism: false,
  },
};
