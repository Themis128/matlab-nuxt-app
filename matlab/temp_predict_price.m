
cd('D:/Nuxt Projects/MatLab/mobiles-dataset-docs');
try
    price = predict_price(8, 4000, 6.5, 174, 2024, 'Apple');
    fprintf('PRICE_RESULT:%.2f\n', price);
catch ME
    fprintf('ERROR:%s\n', ME.message);
    exit(1);
end
exit(0);
