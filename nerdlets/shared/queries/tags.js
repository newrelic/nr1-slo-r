export const tags = guid => {
  const tagsQuery = `{
    actor {
      entity(guid: "${guid}") {
        tags {
          key
          values
        }
      }
    }  
  }  
  `;
  return tagsQuery;
};
