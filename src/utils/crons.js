import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import { couponModel } from '../../DB/models/Coupon.model.js';

export const changeStatusCoupon = () => {
  scheduleJob('* */60 * * * *', async () => {
    const validCoupons = await couponModel.find({ couponStatus: 'valid' });

    validCoupons.forEach(async (coupon) => {
      if (moment(coupon.couponEndData).isBefore(moment())) {
        coupon.couponStatus = 'expired';
      }

      await coupon.save();
    });

    console.log('Cron job is running');
  });
};
