import { join } from "path";

import { addPath, info, setFailed } from "@actions/core";
import { cacheDir, downloadTool, extractTar, find } from "@actions/tool-cache";
import { exec } from "@actions/exec";

const name = "fazz-ecr";
const version = "v0.2.0";
const url =
  `https://github.com/payfazz/${name}/releases/download/${version}/${name}-${version}-linux-x64.tar.gz`;

const main = async () => {
  if (process.platform != "linux") {
    throw new Error("only support linux");
  }

  let toolPath = find(name, version);
  if (toolPath) {
    info(`Found in cache @  ${toolPath}`);
  } else {
    info(`Attempting to donwload ${url}`);
    const downloadPath = await downloadTool(url);
    const extractPath = await extractTar(downloadPath);
    toolPath = await cacheDir(extractPath, name, version);
    info(`Successfully cached to ${toolPath}`);
  }

  const exitCode = await exec(
    join(toolPath, "bin", "docker-credential-fazz-ecr"),
    ["update-config"],
  );
  if (exitCode != 0) {
    throw new Error("cannot update docker config");
  }
  addPath(join(toolPath, "bin"));
  info(`Successfully setup ${name} version ${version}`);
};

main().catch(setFailed);
