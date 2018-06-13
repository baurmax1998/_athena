/// <reference types="reflect-metadata" />
import { createProperty } from './lit-element.js';
export function customElement(tagname) {
    return (clazz) => {
        window.customElements.define(tagname, clazz);
    };
}
export function property(options) {
    return (prototype, propertyName) => {
        options = options || {};
        options.type = options.type || reflectType(prototype, propertyName);
        createProperty(prototype, propertyName, options);
    };
}
export function attribute(attrName) {
    return (prototype, propertyName) => {
        const type = reflectType(prototype, propertyName);
        createProperty(prototype, propertyName, { attrName, type });
    };
}
export function computed(...targets) {
    return (prototype, propertyName, descriptor) => {
        const fnName = `__compute${propertyName}`;
        // Store a new method on the object as a property.
        Object.defineProperty(prototype, fnName, { value: descriptor.get });
        descriptor.get = undefined;
        createProperty(prototype, propertyName, { computed: `${fnName}(${targets.join(',')})` });
    };
}
export function listen(eventName, target) {
    return (prototype, methodName) => {
        if (!prototype.constructor.hasOwnProperty('listeners')) {
            prototype.constructor.listeners = [];
        }
        prototype.constructor.listeners.push({ target, eventName, handler: prototype[methodName] });
    };
}
;
function reflectType(prototype, propertyName) {
    const { hasMetadata = () => false, getMetadata = () => null } = Reflect;
    if (hasMetadata('design:type', prototype, propertyName)) {
        return getMetadata('design:type', prototype, propertyName);
    }
    return null;
}
//# sourceMappingURL=lit-element-decorators.js.map