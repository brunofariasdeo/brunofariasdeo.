const { default: axios } = require('axios');
const Jimp = require('jimp');
const dateStringifier = require('date-stringifier');

module.exports = async function (user) {
  async function getLastFollower() {
    const followQuantity = (await axios.get(`https://api.github.com/users/${user}`)).data.followers;
    const lastPage = Math.ceil(followQuantity / 30);
    const followers = (await axios.get(`https://api.github.com/users/${user}/followers?page=${lastPage}`)).data;

    const lastFollowerIndex = followers.length - 1;
    const selectedFollower = (await axios.get((followers[lastFollowerIndex]?.url))).data;

    return selectedFollower;
  }

  const follower = await getLastFollower();

  const avatar = await Jimp.read(follower.avatar_url);
  const avatarmask = await Jimp.read('./src/resources/images/levelMask.png');
  avatar.resize(269, 269);
  avatar.mask(avatarmask, 0, 0);

  const base = await Jimp.read('./src/resources/images/CoderBase.png');
  const textFont = await Jimp.loadFont('./src/resources/fonts/Coder30.fnt');
  const titleFont = await Jimp.loadFont('./src/resources/fonts/Coder48.fnt');
  const dateFont = await Jimp.loadFont('./src/resources/fonts/Coder18.fnt');
  const formattedDate = dateStringifier(new Date(follower.created_at), `Joined {DD}/{MM}/{yy}`);

  base
    .composite(avatar, 18, 16)
    .print(textFont, 440, 123, follower.public_repos)
    .print(textFont, 510, 159, follower.followers)
    .print(dateFont, 670, 220, formattedDate)

    .print(titleFont, 430, 33, follower.login);

  await base.writeAsync(`./src/resources/images/followerOfTheDay.png`);

  return `<a href="${follower.html_url}" alt="${follower.name}"><img style="height:150px;" src=./src/resources/images/followerOfTheDay.png alt="Follower of the day"/></a>`;
};
