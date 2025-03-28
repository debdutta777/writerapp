import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Novel {
  _id?: ObjectId;
  title: string;
  description: string;
  coverImage?: string;
  author: ObjectId | User;
  chapters?: Chapter[];
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chapter {
  _id?: ObjectId;
  title: string;
  content: string;
  novelId: ObjectId | Novel;
  chapterNumber: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 