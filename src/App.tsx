import { updatePage } from "@notionhq/client/build/src/api-endpoints";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { queryDatabase, updateStock } from "./utils/notion";

interface Item {
  id: string;
  name: string;
  amount: string;
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await retrieveGroceryList();

      setItems(list);
      setCurrentItem(list[0]);
      setLoading(false);
    })();
  }, []);

  const retrieveGroceryList = async () => {
    try {
      const database = await queryDatabase();
      const list = Object.values(database.results).map((entry) => {
        if ("properties" in entry) {
          if ("title" in entry.properties.Name && "select" in entry.properties.Quantity) {
            return {
              id: entry.id,
              name: entry.properties.Name.title[0].plain_text,
              amount: entry.properties.Quantity.select.name,
            };
          }
        }
      });
      return list;
    } catch (e) {
      console.error(e);
    }
  };

  const updateGroceryList = async () => {
    items.forEach(async (item) => {
      await updateStock(item.id, item.amount);
    });
  };

  const handleStockClick = (e: BaseSyntheticEvent) => {
    const updatedItems = items.map((item) => {
      if (item.name === currentItem.name) {
        return { id: currentItem.id, name: currentItem.name, amount: e.target.id };
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
    const shoppingList = items.map((item) => (
      <li key={item.name}>
        {item.name}: {item.amount}
      </li>
    ));

    if (shoppingList.length > 0) {
      updateGroceryList();
    }

    return shoppingList.length > 0 ? (
      <>
        <h1>Here's our shopping list:</h1>
        {shoppingList}
      </>
    ) : (
      <span>All stocked!</span>
    );
  };

  return loading ? (
    <div className="h-full bg-gray-100 flex flex-col items-center justify-center"></div>
  ) : (
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
