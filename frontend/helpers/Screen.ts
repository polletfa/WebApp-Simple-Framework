/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * Copyright (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * License: MIT (see LICENSE.md file)
 *
 *****************************************************/

export class Screen {
    private static smallScreenLimit = 800;

    public static isSmallScreen(): boolean {
        return Screen.getWidth() < Screen.smallScreenLimit;
    }
    
    public static getWidth(): number {
        return Math.max(
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth,
            document.documentElement.clientWidth
        );
    }

    public static getHeight(): number {
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.documentElement.clientHeight
        );
    }
}

