"use server";

import { CreateEventParams } from "@/types";
import { connectToDatabase } from "../database";
import User from "../database/models/user.model";
import Category from "../database/models/category.model";
import Event from "../database/models/event.model";
import { auth } from "@clerk/nextjs/server";
import { handleError } from "../utils";


const populateEvent =async (query : any) => {
  return query.populate({
    path:'organizer' , model: User , select: '_id firstName lastName'
  })
  .populate({
    path:'category' , model: Category , select: '_id name'
  })
}

export const createEvent = async ({
  event,
  userId,
  path,
}: CreateEventParams) => {
  try {
    await connectToDatabase();
    const { userId: clerkId } = auth();

    const organizer = await User.findOne({ clerkId });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: organizer._id,
    });
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
};

export const getEventById = async (eventId: string) => {
  try {
    await connectToDatabase();

    const event = await populateEvent(Event.findById(eventId))

    if(!event){
      throw new Error("Event Not Found")
    }
    return JSON.parse(JSON.stringify(event))
  } catch (err) {
    handleError(err);
  }
};
