require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' }});

export function createEditor(ax) {
    let editora = { edit: null };

    require(['vs/editor/editor.main'], async () => {
    monaco.languages.register({ id: 'myAsm' });
        monaco.editor.defineTheme('myTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '#e36e82' },
                { token: 'keyword.control', foreground: '#C586C0' },
                { token: 'entity.scene', foreground: '#c0ecd9' },
                { token: 'entity.scene.prefactory', foreground: '#c0ecd9' },
                { token: 'entity.scene.factory', foreground: '#c0ecd9' },
                { token: 'entity.scene.element', foreground: '#c0ecd9' },
                { token: 'entity.class', foreground: '#c0ecd9' },
                { token: 'entity.class.lang', foreground: '#c0ecd9' },
                { token: 'entity.class.user', foreground: '#c0ecd9' },
                { token: 'entity.class.builtin', foreground: '#87d6bf' },
                { token: 'entity.variables.user', foreground: '#95c0d4' },
                { token: 'entity.functions', foreground: '#6de7e3' },
                { token: 'entity.flat', foreground: '#8886e3' },
                { token: 'entity.flat.number', foreground: '#8886e3' },
                { token: 'entity.flat.string', foreground: '#e3b986' },
                { token: 'comment', foreground: '#608B4E' },
            ],
            colors: {
                "editor.foreground": "#ffffff",
                "editor.background": "#1e1e1e"
            }
        });

        let editor;
        editor = monaco.editor.create(document.body, {
            value: ax,
            language: 'myAsm',
            theme: 'myTheme',
            automaticLayout: true
        });

        let updateSyntaxHighlight = (code, ona = false) => {
            let vars = [
                ...[...code.matchAll(/\bclass\s+(\w+)/g)].map(v => v[1]),
                ...[...code.matchAll(/\bclassfunc\s+(\w+)/g)].map(v => v[1]),
                ...[...code.matchAll(/\binterface\s+(\w+)/g)].map(v => v[1])
            ];
            let interfaces = [...code.matchAll(/\binterface\s+(\w+)/g)].map(v => v[1]);
            let classesfuncs = [...code.matchAll(/\bclassfunc\s+(\w+)/g)].map(v => v[1]);

            let objects = [...code.matchAll(/\bvar\b\s+(\w+)\s+=\s+ServerToInit.virtualWorkspace.importScene\(/g)].map(v => v[1]);
            let objectsInstancied = [...code.matchAll(/\bvar\b\s+(\w+)\s+=\s+ServerToInit.virtualWorkspace.addChild\(/g)].map(v => v[1]);
            let instancies = [];
            if (objects.length > 0) {
                let matches = [...code.matchAll(
                    new RegExp(`\\bvar\\b\\s+(\\w+)\\s+=\\s+(${objects.join("|")})\\.instantiate\\(`, 'g')
                )].map(v => v[1]);

                let unique = [...new Set(matches)];
                let safeObjects = matches.map(o =>
                    o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                );
                let objectGroup = `\\b(${safeObjects.join("|")})\\b`;
                if (matches.length > 0) instancies = [[new RegExp(objectGroup), "entity.scene.factory"]];
            }

            let dynamicRule = [];

            if (objectsInstancied.length > 0) {
                let dynamicRegex = new RegExp(`\\b(${objectsInstancied.join("|")})\\b`);
                dynamicRule.push([dynamicRegex, "entity.scene.element"]);
            }

            if (vars.length > 0) {
                let safeVars = vars.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                let dynamicRegex = new RegExp(`\\b(${safeVars.join("|")})\\b`);
                dynamicRule.push([dynamicRegex, "entity.class.user"]);
            }

            if (objects.length > 0) {
                let dynamicRegex = new RegExp(`\\b(${objects.join("|")})\\b`);
                dynamicRule.push([dynamicRegex, "entity.scene.prefactory"]);
            }

            if (ona) return {
                objects,
                vars,
                objectsInstancied,
                interfaces,
                classesfuncs
            }

            monaco.languages.setMonarchTokensProvider('myAsm', {
                tokenizer: {
                    root: [
                        [/\/\/.*/, "comment"],
                        [/"[^"]*"/, "entity.flat.string"],
                        [/\b\d+\b/, "entity.flat.number"],
                        [/\b(extends|class|interface|return|classfunc|var|func|if|else)\b/, "keyword"],
                        ...dynamicRule,
                        ...instancies,
                        [/\b(Array|InternalDocsStrictEnum|Boolean|boolean|String|string|Number|number|Math|Object)\b/, "entity.class.lang"],
                        [/\b(print)\b/, "entity.functions"],
                        [/\b\w+\b(?=\()/, "entity.functions"],
                        [/\w+/, "entity.variables.user"],
                        [/./, "entity.variables.user"]
                    ]
                }
            });
        }

        monaco.languages.registerCompletionItemProvider('myAsm', {
            provideCompletionItems: function (model, position) {

                let fastMake = (l, d, dep = false) => {
                    return {
                        label: {
                            label: l,
                            description: d
                        }, kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [l].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: '',
                        tags: dep ? [monaco.languages.CompletionItemTag.Deprecated] : []
                    }
                }

                return {
                    suggestions: [
                        fastMake('number', 'type'),
                        fastMake('string', 'type'),
                        fastMake('boolean', 'type'),
                        fastMake('Number', 'type', true),
                        fastMake('String', 'type', true),
                        fastMake('Boolean', 'type', true),
                        ...(updateSyntaxHighlight(editor.getValue(), true).objects.map(v => fastMake(v, "struct"))),
                        ...(updateSyntaxHighlight(editor.getValue(), true).objectsInstancied.map(v => fastMake(v, "struct"))),
                        ...(updateSyntaxHighlight(editor.getValue(), true).interfaces.map(v => fastMake(v, "type"))),
                        ...(updateSyntaxHighlight(editor.getValue(), true).classesfuncs.map(v => fastMake(v, "struct"))),
                    ]
                };
            }
        });

        editor.onDidChangeModelContent(() => {
            let code = editor.getValue();
            updateSyntaxHighlight(code);
        });

        let code = editor.getValue();
        updateSyntaxHighlight(code);

        editora.edit = editor;
    });

    return editora;
}