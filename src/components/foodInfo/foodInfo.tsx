import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/hooks/hooks';
import { getCurrentFoodById } from 'src/store/slices/foodSlice';
import { red } from '@mui/material/colors';
import Tooltip from '@mui/material/Tooltip';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { IRecipe } from 'src/types/IRecipe';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import { changeLike } from 'src/store/slices/authorizationSlice';
import CalorieCounter from 'src/helpers/calorieCounter';
import carouselDataCounter from 'src/helpers/carouselDataCounter';
import Grid from '@mui/material/Grid';
import styles from './foodInfo.module.scss';
import FoodInfoTable from './foodInfoTable';
import FoodInfoCarousel from './foodInfoCarousel';

const FoodInfo = () => {
  const { foodId } = useParams();
  const dispatch = useAppDispatch();
  const { currentFoodData } = useAppSelector((store) => store.food);
  const { registeredUserData } = useAppSelector((store) => store.authorization);
  const [dailyValue, setDailyValue] = useState<number>(0);
  const [serving, setServing] = useState<number>(1);
  const cuisineTypePhoto = currentFoodData
    ? currentFoodData?.cuisineType[0].slice(0, 1).toUpperCase() + currentFoodData?.cuisineType[0].slice(1) : 'no Photo';
  const likeIcon = registeredUserData?.likedFoodsData?.map((item:IRecipe) => item.recipeId)
    .includes(currentFoodData?.recipeId || 'null')
    ? <Favorite sx={{ color: red[900] }} /> : <FavoriteBorder sx={{ color: red[900] }} />;

  useEffect(() => {
    if (foodId) dispatch(getCurrentFoodById(foodId));
  }, []);
  useEffect(() => {
    if (registeredUserData && currentFoodData) {
      const currentDailyValue = CalorieCounter(
        registeredUserData?.userAge,
        registeredUserData?.userGender,
        currentFoodData.calories / serving,
      );
      setDailyValue(currentDailyValue);
    }
  }, [currentFoodData]);
  const changeFoodLike = () => {
    if (registeredUserData && currentFoodData) {
      dispatch(changeLike({ userId: registeredUserData?._id, recipe: currentFoodData }));
    }
  };
  const changeDailyValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) > 0) {
      setServing(Number(e.target.value));
      if (registeredUserData && currentFoodData) {
        const currentDailyValue = CalorieCounter(
          registeredUserData?.userAge,
          registeredUserData?.userGender,
          currentFoodData.calories / Number(e.target.value),
        );
        setDailyValue(currentDailyValue);
      }
    }
  };
  if (!currentFoodData) {
    return (
      <CircularProgress />
    );
  }
  const carouselDataArray = carouselDataCounter(currentFoodData.ingredients);
  return (
    <div className={styles.Food__Info}>
      <h2>
        {currentFoodData?.label}
        {registeredUserData
        && (
        <IconButton onClick={changeFoodLike} aria-label="add to favorites">
          {likeIcon}
        </IconButton>
        )}
      </h2>

      <div className={styles.Food__Info_Header}>
        <Tooltip title={`cuisine type - ${currentFoodData?.cuisineType[0]}`} placement="left-start">
          <Avatar
            alt={currentFoodData?.cuisineType[0]}
            src={`https://desolate-forest-80876.herokuapp.com//${cuisineTypePhoto}.png`}
            sx={{ width: 86, height: 86 }}
          />
        </Tooltip>
        <div>
          <h4 className={styles.Food__Info_SubHeader}>
            Nutrition
            {' '}
            <Tooltip
              title={`
              ${registeredUserData?.userGender} daily calorie intake for an ${registeredUserData?.userAge} year old 
`}
              placement="left-start"
            >
              <QuestionMarkIcon sx={{ width: 14, height: 1 }} />
            </Tooltip>
          </h4>
          <div className={styles.Food__Info_Nutrition}>
            <p>
              <input
                type="text"
                value={Math.round(currentFoodData.calories / serving)}
                className={styles.Food__Info_Output}
                disabled
              />
              <br />
              CALORIES / SERVING
            </p>
            <p>
              <input
                type="text"
                value={`${dailyValue}%`}
                className={styles.Food__Info_Output}
                disabled
              />
              <br />
              DAILY VALUE
            </p>
            <p>
              <input
                placeholder="Count"
                type="number"
                value={serving}
                className={styles.Food__Info_Input}
                onChange={changeDailyValue}
              />
              <br />
              SERVINGS
            </p>
          </div>
        </div>
      </div>
      <h3>Ingredients:</h3>
      <div className={styles.Food__Info_Carousel}>
        <Grid container>
          <Grid item sm={6} lg={6} xs={12}>
            <FoodInfoCarousel carouselDataArray={carouselDataArray} />
          </Grid>
          <Grid item sm={6} lg={6} xs={12}>
            <FoodInfoTable ingredients={currentFoodData.ingredients} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
export default FoodInfo;
