import { ITour } from "./tour.interface";
import { Tour } from "./tour.model";

const createTour = async (payload: Partial<ITour>) => {
    const existingTour = await Tour.findOne({ title: payload.title });

    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }
    // const baseSlug = payload.title.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}`

    // let counter = 0;
    // while (await Tour.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }

    // payload.slug = slug;

    const tour = await Tour.create(payload);
    return tour
};





export const TourServices = {
    createTour
}