/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

/**
 * Type for the response of the /SingleUserAuthenticationAPI/status API call
 */
export type SingleUserAuthenticationAPIStatus = { password_set: boolean, logged_in: boolean};

// eslint-disable-next-line
export function isSingleUserAuthenticationAPIStatus(arg: any): arg is SingleUserAuthenticationAPIStatus {
    return ("password_set" in arg) && typeof arg.password_set == "boolean"
        && ("logged_in" in arg) && typeof arg.logged_in == "boolean";
}

/**
 * Type for the data table
 */
export type SingleUserAuthenticationAPIPassword = {pw: string}[];

// eslint-disable-next-line
export function isSingleUserAuthenticationAPIPassword(arg: any): arg is SingleUserAuthenticationAPIPassword {
    return Array.isArray(arg) && (arg.length == 0 ||
        (arg.length == 1 && ("pw" in arg[0]) && typeof arg[0].pw == "string"));
}

