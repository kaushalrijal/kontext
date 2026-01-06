"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

// create new post
export async function createPost(input: {
  caption: string;
  imageUrl: string; // local file path
}) {
  const { caption, imageUrl } = input;
  const userId = await requireUserId();

  if (!caption || !imageUrl) {
    throw new Error("Caption and image are required");
  }

  const post = await prisma.post.create({
    data: {
      caption,
      imageUrl,
      userId,
    },
  });

  // revalidate gallery page
  revalidatePath("/posts");

  return post;
}

// get all posts
export async function listPosts() {
  return prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// get specific post
export async function getPostById(id: string) {
  if (!id) return null;

  return prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}


// update posts
export async function updatePost(input: {
  id: string;
  caption?: string;
  imageUrl?: string;
}) {
  const { id, caption, imageUrl } = input;
  const userId = await requireUserId();

  if (!id) {
    throw new Error("Post id is required");
  }

  const existing = await prisma.post.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Post not found");
  }

  if (existing.userId !== userId) {
    throw new Error("Forbidden");
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
  const userId = await requireUserId();

  if (!id) {
    throw new Error("Post id is required");
  }

  const existing = await prisma.post.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Post not found");
  }

  if (existing.userId !== userId) {
    throw new Error("Forbidden");
  }

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/posts");

  return { success: true };
}