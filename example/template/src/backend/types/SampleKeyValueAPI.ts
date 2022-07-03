/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

export type SampleKeyValueAPIListItem = {key: string, value: string};

// eslint-disable-next-line
export function isSampleKeyValueAPIListItem(arg: any): arg is SampleKeyValueAPIListItem {
    return ("key" in arg) && typeof arg.key == "string"
        && ("value" in arg) && typeof arg.value == "string";
}

export type SampleKeyValueAPIList = SampleKeyValueAPIListItem[];

// eslint-disable-next-line
export function isSampleKeyValueAPIList(arg: any): arg is SampleKeyValueAPIList {
    return Array.isArray(arg) && arg.every(i => isSampleKeyValueAPIListItem(i));
}

