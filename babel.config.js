module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Иначе Metro может тянуть флаг из старого кэша и гонять React Compiler на web — ломаются хелперы вроде _objectWithoutPropertiesLoose.
          'react-compiler': false,
        },
      ],
    ],
  };
};
