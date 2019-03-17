module.exports = {
  antiSpam: {
    maxDuplicatesWarning: 5,
    maxDuplicatesPenalize: 7,
    penalizeExpCount: 20,
    warnBuffer: 4,
    penalizeBuffer: 6,
    interval: 6000,
  },
  exp: {
    photo: 1,
    audio: 1,
    video: 1,
    sticker: 0,
    gift: 10,
  },
};
