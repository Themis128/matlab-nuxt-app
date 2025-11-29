
cd('D:/Nuxt Projects/MatLab/mobiles-dataset-docs');
try
    brand = predict_brand(8, 4000, 6.1, 174, 2024, 999);
    fprintf('BRAND_RESULT:%s\n', char(brand));
catch ME
    fprintf('ERROR:%s\n', ME.message);
    exit(1);
end
exit(0);
