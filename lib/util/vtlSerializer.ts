export function vtlSerializer(body: object, keys: string[]) {
  // Match the keys and replace value with locators
  let json = JSON.stringify(body, (key, value) => {
    if (keys.includes(key)) {
      return `#REPLACE# ${value} #REPLACE#`;
    }
    return value;
  });

  // locate the quotation marks and remove them
  while (json.includes(`#REPLACE#`)) {
    json = json.replace(`"#REPLACE#`, "").replace(`#REPLACE#"`, "");
  }

  // return vtl string
  const vtl = json;
  return vtl;
}
