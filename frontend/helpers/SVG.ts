/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * Copyright (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * License: MIT (see LICENSE.md file)
 *
 *****************************************************/

export type Pos = { x: number, y: number };
export type Size = { width: number, height: number };
export type Rect = Pos & Size;
export type Font = { family: string, size: string, weight: string, color: string };

export class SVG {
    private name: string;
    private attributes: Map<string, string> = new Map();
    private children: (SVG|string)[] = [];

    constructor(name = "svg") {
        this.name = name;
    }

    public addAttribute(key: string, value: string): SVG {
        this.attributes.set(key, value);
        return this;
    }

    public addChild(child: SVG|string): SVG {
        this.children.push(child);
        return this;
    }
    
    /**
     * Build the SVG
     *
     * @return SVG as a string
     */
    public toString(): string {
        return '<' + this.name + ' '
            + Array.from(this.attributes).map(i => i[0]+'="'+i[1]+'"').join(' ')+'>'
            + this.children.map(i => typeof i == "string" ? i : i.toString()).join('')
            + '</' + this.name + '>';
    }

}

/**
 * Center a text into an invisible rectangle
 */
export class CenteredText extends SVG {
    constructor(rect: Rect, font: Font, text: string) {
        super();
        this.addAttribute("x", rect.x.toString())
            .addAttribute("y", rect.y.toString())
            .addAttribute("width", rect.width.toString())
            .addAttribute("height", rect.height.toString())
            .addChild(
                new SVG("text")
                    .addAttribute("x", "50%")
                    .addAttribute("y", "50%")
                    .addAttribute("dominant-baseline", "central")
                    .addAttribute("text-anchor", "middle")
                    .addAttribute("fill", font.color)
                    .addAttribute("style", "font-size: "+font.size+"; font-family: "+font.family+"; font-weight: "+font.weight)
                    .addChild(text)
            )
    }
}

/**
 * Create a rectangle
 */
export class Rectangle extends SVG {
    constructor(rect: Rect, bgcolor: string, rounded: Pos|undefined = undefined) {
        super("rect");
        this.addAttribute("x", rect.x.toString())
            .addAttribute("y", rect.y.toString())
            .addAttribute("width", rect.width.toString())
            .addAttribute("height", rect.height.toString())
            .addAttribute("style", "fill: "+bgcolor);
        if(rounded !== undefined) {
            this.addAttribute("rx", rounded.x.toString())
                .addAttribute("ry", rounded.y.toString());
        }
    }
}

/**
 * Create a polygon
 */
export class Polygon extends SVG {
    constructor(points: Pos[], style: string) {
        super("polygon");
        this.addAttribute("points", points.map(i => i.x.toString() + "," + i.y.toString()).join(" "))
            .addAttribute("style", style);
    }   
}
