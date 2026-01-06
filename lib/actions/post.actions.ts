"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// create new post
export async function createPost(input: {
  caption: string;
  imageUrl: string; // local file path
}) {
  const { caption, imageUrl } = input;

  if (!caption || !imageUrl) {
    throw new Error("Caption and image are required");
  }

  const post = await prisma.post.create({
    data: {
      caption,
      imageUrl,
    },
  });

  // revalidate gallery page
  revalidatePath("/posts");

  return post;
}

// get all posts
export async function listPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// get specific post
export async function getPostById(id: string) {
  if (!id) return null;

  return prisma.post.findUnique({
    where: { id },
  });
}


// update posts
export async function updatePost(input: {
  id: string;
  caption?: string;
  imageUrl?: string;
}) {
  const { id, caption, imageUrl } = input;

  if (!id) {
    throw new Error("Post id is required");
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(caption !== undefined && { caption }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });

  revalidatePath(`/posts/${id}`);
  revalidatePath("/posts");

  return post;
}


// delete posts
export async function deletePost(id: string) {
  if (!id) {
    throw new Error("Post id is required");
  }

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/posts");

  return { success: true };
}