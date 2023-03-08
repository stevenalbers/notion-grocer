import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export const tryNotion = async (text: string) => {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Quantity: {
          select: {
            name: text,
          },
        },
      },
    });
    console.log("Success! Entry added.", response);
  } catch (e) {
    console.error(e);
  }
};

export const retrieveDatabase = async (id: string = databaseId) => {
  return await notion.databases.retrieve({ database_id: id });
};

export const queryDatabase = async (id: string = databaseId) => {
  return await notion.databases.query({
    database_id: id,
  });
};

export const retrievePage = async (id: string) => {
  return await notion.pages.retrieve({ page_id: id });
};

export const retrieveBlock = async (id: string) => {
  return await notion.blocks.retrieve({ block_id: id });
};

export const updateStock = async (id: string, stock: string) => {
  // TODO: Investigate why Notion reports a 400 on update
  return await notion.pages.update({
    page_id: id,
    properties: {
      Quantity: {
        select: {
          name: stock,
        },
      },
    },
  });
};
