Installation of Dependencies

A. RPI Installation
    1.0 UPDATING THE OS
        pi@raspberrypi:~ $ sudo apt update && sudo apt upgrade -y
    2.0 APCAHE INSTALLATION
        pi@raspberrypi:~ $ sudo apt install apache2 -y
    3.0 TEST INSTALLATION
        pi@raspberrypi:~ $ cd /var/www/html
        pi@raspberrypi:/var/www/html $ ls -al
        index.html
    3.1 IDENTIFY USER
        pi@raspberrypi:/var/www/html $ hostname -I
        
B. PHP INSTALLATION
    1.0 INSTALL PHP
        pi@raspberrypi:/var/www/html $ sudo apt install php -y
    2.0 REMOVE index.html and CREATE PHP script
        pi@raspberrypi:/var/www/html $ sudo rm index.html
        pi@raspberrypi:/var/www/html $ sudo nano index.php
    3.0 RESTART APACHE2
        pi@raspberrypi:/var/www/html $ sudo service apache2 restart

C. INSTALL MYSQL
    1.0 INSTALL MYSQL
        pi@raspberrypi:/var/www/html $ sudo apt install mariadb-server php-mysql -y
        pi@raspberrypi:/var/www/html $ sudo service apache2 restart
    2.0 SECURE RUN COMMAND
        pi@raspberrypi:/var/www/html $ sudo mysql_secure_installation
    3.0 CREATE NEW USER (OPTIONAL)
        pi@raspberrypi:/var/www/html $ sudo mysql --user=root --password
        > create user admin@localhost identified by 'your_password';
        > grant all privileges on *.* to admin@localhost;
        > FLUSH PRIVILEGES;
        > exit;

D. INSTALL PHPMYADMIN
    1.0 Installation
        pi@raspberrypi:/var/www/html $ sudo apt install phpmyadmin -y
    2.0 ENABLE APACHE2 and RESTART 
        pi@raspberrypi:/var/www/html $ sudo phpenmod mysqli
        pi@raspberrypi:/var/www/html $ sudo service apache2 restart
    3.0 move the phpmyadmin folder to /var/www/html
        pi@raspberrypi:/var/www/html $ sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin    
    4.0 VERIFY LIST
        pi@raspberrypi:/var/www/html $ ls
        phpmyadmin
    5.0 MANAGE PERMISSION (OPTIONAL)
        pi@raspberrypi:~ $ ls -lh /var/www/
        pi@raspberrypi:~ $ sudo chown -R pi:www-data /var/www/html/
        pi@raspberrypi:~ $ sudo chmod -R 770 /var/www/html/
        pi@raspberrypi:~ $ ls -lh /var/www/
