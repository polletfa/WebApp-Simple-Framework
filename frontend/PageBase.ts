/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { FrontendApplication } from "./FrontendApplication";

/**
 * Base for all pages
 */
export abstract class PageBase {
    /**
     * Method called when the page is shown
     */
    public abstract showPage(): void;
}
