
// blockcly-build
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as fs from 'node:fs';
import path from 'node:path';
import { argv, cwd, exit } from 'node:process';

let params = argv.slice(2);
let operation = params.length >= 1 ? params[0] : 'build';
let folder = params.length >= 2 ? path.join(cwd(), params[1]) : cwd();
let cfg_file = path.join(folder, 'cfg.json');

function CliToolExecute(a) {
    if (a === 'start') {
        const new_cfg = {};

        new_cfg.gen = 'auto';
        new_cfg.resPath = 'Resources';
        new_cfg.rootRes = 'main.clay';

        const new_cfg_str = JSON.stringify(new_cfg);
        writeFileSync(cfg_file, new_cfg_str, 'utf-8');
    }
    else if (a == 'build') {
        // configuration ready to build
        const cfg_json_str = readFileSync(cfg_file, 'utf-8');
        const cfg_params = JSON.parse(cfg_json_str);
        const cfg_res_path = cfg_params.resPath;
        const cfg_root_res = cfg_params.rootRes;
        const cfg_gen = cfg_params.gen;

        // Path confiers and extensions
        const cfgd_pathres_dir = path.join(folder, cfg_res_path);
        const cfgd_pathres_root = path.join(folder, cfg_res_path ,cfg_root_res);
        const cfg_3dmod_ext = [ '.rsc', '.3db', '.shp'];
        const cfg_logic_ext = [ '.clay', '.cly', '.src', '.cls'];

        // Path Res dir
        const dir_res = fs.opendirSync(cfgd_pathres_dir);
        const scriptFiles = [];
        const modelsFiles = [];

        try {
            let dirent;
            while ((dirent = dir_res.readSync()) !== null) {
                if (dirent.isFile()) {
                    const ext = path.extname(dirent.name).toLowerCase();
                    const pathfull = path.join(dirent.parentPath, dirent.name);
                    const dir_props = [pathfull, dirent.name.slice(0, -(ext.substring(1).length)-1), ext];

                    if (cfg_3dmod_ext.includes(ext)) {
                        modelsFiles.push(dir_props);
                    }
                    else if (cfg_logic_ext.includes(ext)) {
                        scriptFiles.push(dir_props);
                    }
                }
            }
        } finally {
            dir_res.closeSync();
        }

        let output_header = `var _res = Object();\n`;
        modelsFiles.forEach(v => {
            const [path, name, ext] = v
            const vectorizator = `"${readFileSync(path)}"`;

            output_header += `_res.set("${name}", ${vectorizator});\n`;
        })

        console.log(output_header)
    }
}

if (!existsSync(cfg_file) && operation !== 'start') {
    CliToolExecute('start');
    exit(0);
}

CliToolExecute(operation);