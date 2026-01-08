import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getWardrobe, deleteWardrobeItem, uploadWardrobeItem} from '../../store/slices/wardrobeSlice';
import ImagePicker from '../../components/ImagePicker';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import {colors} from '../../constants/colors';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Footwear', 'Accessories'];

const WardrobeScreen = () => {
  const dispatch = useDispatch();
  const {items, loading} = useSelector((state) => state.wardrobe);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState('Tops');
  const [color, setColor] = useState('');

  useEffect(() => {
    dispatch(getWardrobe(selectedCategory));
  }, [dispatch, selectedCategory]);

  const handleUpload = () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    dispatch(
      uploadWardrobeItem({
        imageUri,
        category,
        color,
        styleTags: [],
      })
    ).then((result) => {
      if (!result.error) {
        Alert.alert('Success', 'Item added to wardrobe');
        setModalVisible(false);
        setImageUri(null);
        setColor('');
        setCategory('Tops');
      } else {
        Alert.alert('Error', result.error);
      }
    });
  };

  const handleDelete = (itemId) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteWardrobeItem(itemId));
        },
      },
    ]);
  };

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wardrobe</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory(null)}>
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.selectedCategoryText,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(cat)}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.selectedCategoryText,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Wardrobe Items */}
      <ScrollView style={styles.itemsContainer} contentContainerStyle={styles.itemsContent}>
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
        {!loading && filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in wardrobe</Text>
            <Text style={styles.emptySubtext}>Add your first item to get started</Text>
          </View>
        )}
        {filteredItems.map((item) => (
          <Card key={item._id} style={styles.itemCard}>
            <Image source={{uri: item.imageUrl}} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              {item.color && <Text style={styles.itemColor}>{item.color}</Text>}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Item to Wardrobe</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <ImagePicker
                label="Item Image"
                imageUri={imageUri}
                onImageSelected={setImageUri}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryOptions}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.selectedCategoryOption,
                    ]}
                    onPress={() => setCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === cat && styles.selectedCategoryOptionText,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Color (Optional)"
                value={color}
                onChangeText={setColor}
                placeholder="e.g., Black, Blue, Red"
              />

              <Button title="Add Item" onPress={handleUpload} loading={loading} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: colors.accent,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.white,
    fontWeight: '600',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemCard: {
    width: '48%',
    marginBottom: 16,
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  itemInfo: {
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemColor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedCategoryOption: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default WardrobeScreen;

