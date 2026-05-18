# A Laravel package for generating shipping labels

[![Latest Version on Packagist](https://img.shields.io/packagist/v/omaghd/shipping-label.svg?style=flat-square)](https://packagist.org/packages/omaghd/shipping-label)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/omaghd/shipping-label/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/omaghd/shipping-label/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/omaghd/shipping-label/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/omaghd/shipping-label/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/omaghd/shipping-label.svg?style=flat-square)](https://packagist.org/packages/omaghd/shipping-label)

Generate fast, precise PDF shipping labels with a flexbox-inspired layout engine. The package keeps the domain (elements and styling) separate from layout math and rendering, uses readonly value objects, and ships with a TCPDF driver pre-configured for internal fonts.

## Installation

You can install the package via composer:

```bash
composer require omaghd/shipping-label
```

## Usage

```php
use OmaghD\ShippingLabel\Label;
use OmaghD\ShippingLabel\Nodes\Column;
use OmaghD\ShippingLabel\Nodes\Row;
use OmaghD\ShippingLabel\Enums\BarcodeType;
use OmaghD\ShippingLabel\Enums\Unit;
use OmaghD\ShippingLabel\ValueObjects\Color;
use OmaghD\ShippingLabel\ValueObjects\Gutter;
use OmaghD\ShippingLabel\ValueObjects\Margin;
use OmaghD\ShippingLabel\ValueObjects\Padding;
use OmaghD\ShippingLabel\Config\LabelConfig;
use OmaghD\ShippingLabel\Config\RowConfig;
use OmaghD\ShippingLabel\Config\ColumnConfig;
use OmaghD\ShippingLabel\Config\TextStyleConfig;
use OmaghD\ShippingLabel\Elements\TextElement;
use OmaghD\ShippingLabel\Elements\ImageElement;
use OmaghD\ShippingLabel\Elements\SpacerElement;
use OmaghD\ShippingLabel\Elements\BulletsElement;
use OmaghD\ShippingLabel\Elements\RadioElement;
use OmaghD\ShippingLabel\Elements\BarcodeElement;
use OmaghD\ShippingLabel\Elements\QrCodeElement;
use OmaghD\ShippingLabel\Config\Elements\TextElementConfig;
use OmaghD\ShippingLabel\Config\Elements\ImageElementConfig;
use OmaghD\ShippingLabel\Config\Elements\SpacerElementConfig;
use OmaghD\ShippingLabel\Config\Elements\BulletsElementConfig;
use OmaghD\ShippingLabel\Config\Elements\RadioElementConfig;
use OmaghD\ShippingLabel\Config\Elements\BarcodeElementConfig;
use OmaghD\ShippingLabel\Config\Elements\QrCodeElementConfig;

Route::get('labels', function () {
    $label = Label::make()
        ->config(
            config: LabelConfig::make()
                ->square()
                ->unit(Unit::Mm)
                ->borderStroke(width: 0.1)
                ->borderColor(hexCode: Color::BLACK)
                ->margin(margin: Margin::uniform(5))
                ->gutter(gutter: Gutter::symmetric(2))
                ->defaultTextStyle(
                    config: TextStyleConfig::make()
                        ->fontSize(value: 8.0)
                        ->color(hexCode: Color::fromHex('#000000'))
                )
        );

    $orders = [
        ['id' => '101123456789', 'name' => 'Omar EL ATMANI', 'city' => 'Rabat', 'phone' => '06 23 28 02 12'],
        ['id' => '102123456789', 'name' => 'Sara ALAMI', 'city' => 'Casablanca', 'phone' => '06 11 22 33 44'],
        ['id' => '103123456789', 'name' => 'Ahmed BENNANI', 'city' => 'Fes', 'phone' => '06 55 66 77 88'],
        ['id' => '104123456789', 'name' => 'Karim TAZI', 'city' => 'Tangier', 'phone' => '06 99 88 77 66'],
        ['id' => '105123456789', 'name' => 'Ikram SADIKI', 'city' => 'Marrakech', 'phone' => '06 12 34 56 78'],
    ];

    foreach ($orders as $index => $order) {
        if ($index > 0) {
            $label->nextLabel();
        }

        $label
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 2.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: ImageElement::make()
                                    ->path(path: public_path('assets/images/logo.svg'))
                                    ->config(
                                        config: ImageElementConfig::make()
                                            ->height(value: 2.0)
                                            ->width(value: 20.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: $order['city'])
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->bold()
                                            ->fontSize(value: 8.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Hub ' . $order['city'])
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Amount')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->horizontalAlignCenter()
                                    )
                            )
                            ->addElement(
                                element: SpacerElement::make()
                                    ->config(
                                        config: SpacerElementConfig::make()
                                            ->height(value: 2.0)
                                    )
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: '$399')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->bold()
                                            ->fontSize(value: 10.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.5)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Client: **' . $order['name'] . '**')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Client Phone: **' . $order['phone'] . '**')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.5)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Address: **Street 1, ' . $order['city'] . '**')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 3.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignTop()
                                    ->horizontalAlignStart()
                            )
                            ->addElement(
                                element: BulletsElement::make()
                                    ->addItem(text: '1x : iPhone 17 Pro Max')
                                    ->addItem(text: '4x : Sony WH-1000XM4')
                                    ->addItem(text: '1x : Samsung Galaxy S21')
                                    ->config(
                                        config: BulletsElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->lineHeight(value: 3.5)
                                            ->horizontalAlignStart()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Store: Floral Shop')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Store Phone: 522 456 1234')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Store Address: Street 123')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.5)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'For customer service purposes, call us on: 522 456 7899')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.5)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: RadioElement::make()
                                    ->label(text: 'Open:')
                                    ->selectedLabel(text: 'Yes')
                                    ->unselectedLabel(text: 'No')
                                    ->selected(state: true)
                                    ->config(
                                        config: RadioElementConfig::make()
                                            ->verticalAlignMiddle()
                                            ->horizontalAlignStart()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: RadioElement::make()
                                    ->label(text: 'Try:')
                                    ->selectedLabel(text: 'Yes')
                                    ->unselectedLabel(text: 'No')
                                    ->selected(state: false)
                                    ->config(
                                        config: RadioElementConfig::make()
                                            ->verticalAlignMiddle()
                                            ->horizontalAlignStart()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: RadioElement::make()
                                    ->label(text: 'Exchange:')
                                    ->selectedLabel(text: 'Yes')
                                    ->unselectedLabel(text: 'No')
                                    ->selected(state: false)
                                    ->config(
                                        config: RadioElementConfig::make()
                                            ->verticalAlignMiddle()
                                            ->horizontalAlignStart()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.5)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Thank you for choosing us.')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->lineHeight(value: 1.2)
                                            ->maxLines(2)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 3.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 3)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: BarcodeElement::make()
                                    ->code(text: 'OM' . $order['id'])
                                    ->type(type: BarcodeType::C128)
                                    ->config(
                                        config: BarcodeElementConfig::make()
                                            ->height(value: 13.0)
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: ImageElement::make()
                                    ->path(path: public_path('assets/images/image.png'))
                                    ->config(
                                        config: ImageElementConfig::make()
                                            ->height(value: 13.0)
                                            ->width(value: 13.0)
                                            ->fitCover()
                                    )
                            )
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->padding(padding: Padding::uniform(0))
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: QrCodeElement::make()
                                    ->content(text: 'https://omaghd.com/track/' . $order['id'])
                                    ->config(
                                        config: QrCodeElementConfig::make()
                                            ->fontSize(value: 13.0)
                                    )
                            )
                    )
            )
            ->addRow(
                row: Row::make()
                    ->config(
                        config: RowConfig::make()
                            ->height(ratio: 1.0)
                    )
                    ->addColumn(
                        column: Column::make()
                            ->config(
                                config: ColumnConfig::make()
                                    ->span(weight: 1)
                                    ->verticalAlignMiddle()
                                    ->horizontalAlignCenter()
                            )
                            ->addElement(
                                element: TextElement::make()
                                    ->content(text: 'Our shipping company is responsible for delivery only.')
                                    ->config(
                                        config: TextElementConfig::make()
                                            ->fontSize(value: 6.0)
                                            ->horizontalAlignCenter()
                                    )
                            )
                    )
            );
    }

    $label->render(filename: 'labels.pdf');
});
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [OmaghD](https://github.com/OmaghD)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
