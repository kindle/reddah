using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Reddah.AesTool
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private const string AesKeyValue = "8d47b901a38c43efbb2b5d0d599ef5e2";
        private const string AesIVValue = "c70e4eb7b8288140";
        private const string ConnectionStringFormat = "Data Source={sample:euxvrosyev.database.windows.net};Initial Catalog={DatabaseName};User ID={Username};Password={password};Encrypt=True";

        public MainWindow()
        {
            InitializeComponent();

            this.aesKey.Text = AesKeyValue;
            this.aesIV.Text = AesIVValue;
            this.sourceStringToEncrypt.Text = ConnectionStringFormat;

            this.encrypt.Click += delegate
            {
                this.destinationString.Text = PasswordAesProvider.Encrypt(
                    this.sourceStringToEncrypt.Text,
                    this.aesKey.Text,
                    this.aesIV.Text);
            };

            this.decrypt.Click += delegate
            {
                this.destinationString.Text = PasswordAesProvider.Decrypt(
                    this.sourceStringToDecrypt.Text,
                    this.aesKey.Text,
                    this.aesIV.Text);
            };
        }
    }
}
