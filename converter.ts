import { v4 } from "https://deno.land/std@0.95.0/uuid/mod.ts";

interface Folder {
  id: string;
  name: string;
}

interface Item {
  id: string;
  organizationId?: string;
  folderId?: string;
  type: number;
  name: string;
  notes?: string;
  favorite: boolean;
  fields: Field[];
  login: Login;
  collectionIds?: string;

  card: Card;
}

interface Field {
  name: string;
  value: string;
  type: number;
}

interface Login {
  uris: Uri[];
  username?: string;
  password?: string;
  totp?: string;
}

interface Uri {
  match?: string;
  uri: string;
}

interface Card {
  cardholderName: string;
  brand: "Visa" | "Mastercard";
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

function getTags(folders: Folder[], item: Item) {
  const tag = folders.find((folder) => folder.id === item.folderId);
  if (!tag) {
    return [];
  }

  return [tag.name];
}

export function convertCsv(folders: Folder[], items: Item[]) {
  const logins = items.filter((item) => item.type === 1);
  const cards = items.filter((item) => item.type === 3);

  const newLogins = logins.map((item) => {
    const uris = item.login.uris;
    const uri = uris && uris.length ? uris[0].uri : null;
    const customFields = (item.fields || []).map(({ name, value }) => {
      return { k: "concealed", v: value, t: name };
    }, {});

    return {
      title: item.name,

      openContents: item.folderId
        ? {
          tags: getTags(folders, item),
        }
        : {},

      secureContents: {
        URLs: uri
          ? [
            {
              url: uri,
              label: "website",
            },
          ]
          : [],

        fields: [
          {
            type: "T",
            designation: "username",
            name: "username",
            value: item.login.username,
          },
          {
            type: "P",
            designation: "password",
            name: "password",
            value: item.login.password,
          },
        ],

        notesPlain: item.notes,

        ...(customFields
          ? {
            sections: [
              {
                fields: customFields,
                title: "Custom Fields from Bitwarden",
                name: `Section_${v4.generate()}`,
              },
            ],
          }
          : {}),
      },
      location: uri,
      typeName: "webforms.WebForm",
    };
  });

  const cardTypeMap = {
    Visa: "visa",
    Mastercard: "mc",
  };

  const newCards = cards.map((item) => {
    return {
      title: item.name,

      openContents: item.folderId
        ? {
          tags: getTags(folders, item),
        }
        : {},

      secureContents: {
        cardholder: item.card.cardholderName,
        type: cardTypeMap[item.card.brand],
        ccnum: item.card.number,
        expiry_mm: item.card.expMonth,
        expiry_yy: item.card.expYear,
        code: item.card.cvv,
        notesPlain: item.notes,
      },
      typeName: "wallet.financial.CreditCard",
    };
  });

  const lines = [...newLogins, ...newCards]
    .map((item) => JSON.stringify(item, null, ""))
    .join("\n***5642bee8-a5ff-11dc-8314-0800200c9a66***\n")
    .concat("\n***5642bee8-a5ff-11dc-8314-0800200c9a66***");

  return lines;
}
