<h3 class="wp-block-heading" id="6-progetto-vendite-immobili">Property Sales Project</h3>
<p>I recently developed a small property/construction site management project and related property marketing and sales campaigns.</p>

<p>In the project I created some Resources:</p>
<p></p>
<p><b>ChannelResource</b>: for the management of Sales Channels;</p>
<p><b>HouseResource</b>: for the management of properties</p>
<p><b>MarketingResource</b>: for the management of Marketing activities</p>
<p><b>SaleResource</b>: for Sales management</p>
<p><b>WorkSite</b>: for the management of construction sites</p>
<p>I set up a navigation menu by grouping the items. Below I report the settings made within the class ChannelResource: the menu item Channel is grouped in Marketing, with icon globe-alt, labels Canali and fifth in the order of navigation menu items.</p>

<code>protected static ?string $model = Channel::class;
protected static ?string $navigationGroup = 'Marketing';
protected static ?string $navigationIcon = 'heroicon-o-globe-alt';
protected static ?string $navigationLabel = 'Canali';
protected static ?int $navigationSort = 5;</code>

<h4>Form</h4>
<p>In the Property Management Form we used different types of information:</p>

<p><b>Select</b>: to allow the choice of the construction site of which the property is part, taking advantage of the one-to-many relationship worksite specified in model</p>

<code>Forms\Components\Select::make('worksite_id')
                    ->label('Cantiere')
                    ->relationship('worksite', 'name')
                    ->required(),</code>
                    
<p><b>TextInput</b>: to allow setting the property code, mandatory entry, Code label, and maximum length 15 characters</p>

<code>Forms\Components\TextInput::make('code')
                    ->label('Codice')
                    ->required()
                    ->maxLength(15),</code>
                    
<p><b>Select</b>: so that it is possible to choose the type of property between apartment and villa</p>

<code>Forms\Components\Select::make('type')
                    ->label('Tipologia')
                    ->options([
                        'appartamento' => 'Appartamento',
                        'villa' => 'Villa',
                    ]),</code>

<p><b>FileUpLoad</b>: to allow the uploading of the image of the property, where:</p>

<p><b>preserveFilenames</b>: to keep the original name of the file</p>
<p><b>imagePreviewHeight</b>: for definite the size (height) of the image preview</p>
<p>imageResizeTargetWidth e imageResizeTargetHeight</b>: for redefinise the height and width of the uploaded image</p>

<code>Forms\Components\FileUpload::make('attachment')
                    ->image()
                    ->preserveFilenames()
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('16:9')
                    ->imageResizeTargetWidth('300')
                    ->imageResizeTargetHeight('150')
                    ->imagePreviewHeight('250')
                    ->loadingIndicatorPosition('left')
                    ->panelAspectRatio('2:1')
                    ->panelLayout('integrated')
                    ->removeUploadedFileButtonPosition('right')
                    ->uploadButtonPosition('left')
                    ->uploadProgressIndicatorPosition('left'),</code>
                    
<p><b>RichEditor</b>: to allow the field to be loaded followup with the style setting and editing toolbar</p>

<code>Forms\Components\RichEditor::make('followup')
                    ->label('Follow Up')
                    ->maxLength(255),</code>
<h4>Table</h4>

<p>In the list of loaded items, we used the following methods:</p>

<p><b>ImageColumn</b>: to view the photo of the property stored in the field attachment</p>

<code>Tables\Columns\ImageColumn::make('attachment')
                    ->label('Foto'),</code>

<p><b>TextColumn</b>: displaying the price of the property for sale, making the information searchable and orderable</p>

<code>Tables\Columns\TextColumn::make('price')
                    ->label('Prezzo')
                    ->searchable()
                    ->sortable(),</code>

