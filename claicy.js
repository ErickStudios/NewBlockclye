import { run } from "./claicyscript.js"
var runfunc = (await run({}, {}, true)).callFunc

export function ObjectDeserialize(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ('type' in obj) {
            if (obj.type === 'obj' && 'object' in obj) {
                let objne = {};

                for (let [ky, val] of Object.entries(obj.object))
                    objne[ky] = ObjectDeserialize(val);

                return objne;
            }
            else if (obj.type === 'userFunc' && 'body' in obj && 'params' in obj) {
                return async function autogen(scope, ...args) {
                    let factorizedArgs = args.map(ObjectFactorizer);
                    let res = await runfunc(obj, factorizedArgs, scope);
                    return ObjectDeserialize(res);
                };
            }
            else if (obj.type === 'func' && 'func' in obj) {
                let func = obj.func;

                return async function autogen(scope, ...args) {
                    let factorizedArgs = args.map(ObjectFactorizer);
                    let res = await func(factorizedArgs, scope);
                    return ObjectDeserialize(res);
                };
            }
            else if (obj.type === 'array' && 'items' in obj) {
                return obj.items.map(ObjectDeserialize);
            }
        }
    }

    return obj;
}

export function ObjectFactorizer(obj) {
    if (Array.isArray(obj)) {
        return { type: 'array', items: obj.map(ObjectFactorizer) };
    }

    if (typeof obj === 'object' && obj !== null) {
        if (obj instanceof ClaicyObject) {
            return ObjectFactorizer(obj.export());
        }

        let objne = { type: 'obj', object: {} };

        for (let [ky, val] of Object.entries(obj))
            objne.object[ky] = ObjectFactorizer(val);

        return objne;
    }

    if (typeof obj === 'function') {
        return { 
            type: 'func', 
            func(args) {
                let deserializedArgs = args.map(ObjectDeserialize);
                let result = obj.apply(this, deserializedArgs);
                return ObjectFactorizer(result);
            }
        };
    }

    return obj;
}

export class ClaicyTrait {
    constructor(nex={}) {
        this.traitsHas = nex;
    }
    static Convertions = new Map();
    addTrait(name, caster='any') {
        let cast = ClaicyTrait.Convertions.has(caster) ? ClaicyTrait.Convertions.get(caster) : caster;
        this.traitsHas[name] = cast
    }
    validateBool(obj) {
        if (typeof obj !== 'object' || obj === null) return false;
        
        for (let [k, v] of Object.entries(this.traitsHas)) {
            let vali = this.validateProp(k, obj);
            if (vali === false)
                return false;
        }
        return true;
    }
    validate(obj) {
        if (!this.validateBool(obj))
            throw new Error('not valid');

        return obj;
    }
    validateProp(name, obj) {
        let prop_cast = this.traitsHas[name];
        let castar = [
            'string',
            'number',
            'boolean',
            'object',
            'function'
        ]

        if (prop_cast == 'any') {
            return Object.hasOwn(obj, name);
        }
        else if (prop_cast === 'array') {
            return Array.isArray(obj[name]);
        }
        else if (castar.includes(prop_cast))
            return typeof obj[name] === prop_cast;
        else if (prop_cast instanceof ClaicyTrait) {
            return prop_cast.validateBool(obj[name]);
        }
        else if (typeof prop_cast === 'function' && prop_cast.prototype instanceof ClaicyTrait) {
            new prop_cast().validateBool(obj[name]);
        }

        return false;
    }
}
ClaicyTrait.Convertions.set(String, 'string');
ClaicyTrait.Convertions.set(Number, 'number');
ClaicyTrait.Convertions.set(Boolean, 'boolean');
ClaicyTrait.Convertions.set(Array, 'array');
ClaicyTrait.Convertions.set(Object, 'object');
ClaicyTrait.Convertions.set(Function, 'function');

export class ClaicyObject {
    constructor(_props, traits=null) {
        this.origin = _props;
        let props = ObjectDeserialize(_props);
        if (traits instanceof ClaicyTrait) {
            traits.validate(props);
        }
        this.props = props;
    }
    static newFakeObj(obj) {
        return {type: 'obj', object: obj};
    }
    static buble(obj) {
        return new ClaicyObject(ClaicyObject.newFakeObj(obj));
    }
    static castGlobalSpace = this.buble;
    static modernCast(obj) {
        let cs = this.castGlobalSpace(obj);
        return [cs, cs.props, obj]
    }
    export() {
        return this.props;
    }
    static exportObj(obj, cls=null) {
        return new ClaicyObject(obj, cls).export();
    }
    get(k) {
        return this.props[k];
    }
    set(k, v) {
        this.props[k] = v;
    }
}