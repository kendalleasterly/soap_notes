const {parse} = require("./soap/parse-soap")

// const text = "Wendy: rq full body w emphasis on traps and r side body \nHT/Tight: traps (L+), rhomboids (R+), Esg, QL (L+), glutes (L+), calves, TFL, pecs (L+)\nDT on back, glutes (med), tfl, and pecs\ncome back in one month \n\nTzivia: at music festival all weekend, drive 4 hours there and back; hips and low back irritated; rq work on tmj and jaw \nHT/Tight: traps, rhomboids, QL, glutes (med), calves, quads, feet, neck, masseter\nFBDT w focus on problem areas; used heat on glutes\ncome back soon\n\nKendall: runner who sits at desk frequently; has knee pain under patella tendon after running \nHT/Tight: calves, glute med, QL, esg, traps (R+), rhomboids, quads (adhesions and TPs in rec fem and vast lat)\nDT on problem areas, used heat on UB";


let text = `Kendall: this is the subject
-body part one
-body part two glute
     nineteen body parts
this is action deep 
this is plan ()
   

Rachel: bitch
can't do shit
won't stop complaining
she a hoe fr fr
this is action for rackr
this is plan for rackh
`;

async function doStuff() {
    const stuff = await parse(text)
    console.log(stuff)
}

doStuff()