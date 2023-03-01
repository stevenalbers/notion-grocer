import { BaseSyntheticEvent, useEffect, useState } from "react";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

interface Item {
  name: string;
  amount: "Out" | "Low" | "Stocked";
}

export function App() {
  const defaultList: Item[] = [
    { name: "Eggs", amount: "Stocked" },
    { name: "Milk", amount: "Stocked" },
    { name: "Butter", amount: "Stocked" },
  ];
  const [items, setItems] = useState<Item[]>(defaultList);
  const [currentItem, setCurrentItem] = useState(items[0]);

  useEffect(() => {
    tryNotion("new line");
  }, []);

  const tryNotion = async (text) => {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      });
      console.log("Success! Entry added.", response);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStockClick = (e: BaseSyntheticEvent) => {
    const updatedItems = items.map((item) => {
      if (item.name === currentItem.name) {
        return { name: currentItem.name, amount: e.target.id };
      }
      return item;
    });

    setItems(updatedItems);

    if (updatedItems[updatedItems.length - 1]?.name === currentItem.name) {
      setCurrentItem(null);
    } else {
      setCurrentItem(items[items.findIndex((item) => item.name === currentItem.name) + 1]);
    }
  };

  const renderShoppingList = () => {
    const shoppingList = items
      .filter((item) => item.amount !== "Stocked")
      .map((item) => (
        <li key={item.name}>
          {item.name}: {item.amount}
        </li>
      ));

    return shoppingList.length > 0 ? (
      <>
        <h1>Here's our shopping list:</h1>
        {shoppingList}
      </>
    ) : (
      <span>All stocked!</span>
    );
  };

  return (
    <div className="h-full bg-gray-100 flex flex-col items-center justify-center">
      {currentItem && (
        <>
          <h1>How stocked are we on</h1>
          <h2>{currentItem?.name}</h2>
          <div className="">
            <button onClick={handleStockClick} className="btn btn-red" id="Out">
              Out
            </button>
            <button onClick={handleStockClick} className="btn btn-yellow" id="Low">
              Low
            </button>
            <button onClick={handleStockClick} className="btn btn-green" id="Stocked">
              Stocked
            </button>
          </div>
        </>
      )}

      {!currentItem && <div>{renderShoppingList()}</div>}
    </div>
  );
}
